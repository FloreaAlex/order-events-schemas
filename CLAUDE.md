# Order Events Schemas

## Architecture Context

**Workspace**: Archmap Test Platform
**Role**: Shared npm package — single source of truth for all Kafka event contracts across the platform.
**Type**: library
**Package name**: `@florea-alex/order-events-schemas` (v0.3.0)
**Connections** (consumers of this library):
  - ← Order Service via npm import
  - ← Payment Service via npm import
  - ← Product Service via npm import
  - ← Notification Worker via npm import
  - ← Analytics Service via npm import
  - ← Search Indexer Worker via npm import

## Tech Stack

- TypeScript 5.3 (strict mode, compiled to CommonJS ES2022)
- Zod 3.22 (runtime schema validation — only production dependency)
- Jest 29.7 + ts-jest 29.1 (testing)
- Node.js built-in `crypto.randomUUID` (no external UUID library)

## Key Directories

- `src/events/` — One file per event type. Each file exports a Zod schema, a TypeScript type, and (for product/search events) a factory function.
- `src/helpers/create-event.ts` — `createOrderEvent`, `createPaymentEvent`, `validateEvent` — the primary factory/validation API for order and payment events.
- `src/topics.ts` — `TOPICS` and `CONSUMER_GROUPS` constants (Kafka infrastructure strings).
- `src/index.ts` — Barrel re-export file. Everything consumers import comes from here.
- `tests/` — Three Jest test files: `schemas.test.ts` (order/payment), `product-events.test.ts`, `search-events.test.ts`.
- `dist/` — Compiled CommonJS output. Committed to the repo; rebuilt on `prepare`.

## Critical: Two Different Event Envelope Shapes

This library has **two distinct envelope structures**. Getting these wrong is the most common mistake.

### Order & Payment events — `BaseEventSchema`-based

```
{
  type:          string  (order.* or payment.*)
  orderId:       number  (positive int)
  userId:        number  (positive int)
  correlationId: string  (UUID v4)
  timestamp:     string  (ISO 8601)
  data: { ... }          (event-specific payload, field name is "data")
}
```

Used for: all `order.*` and `payment.*` events.
Created via: `createOrderEvent(EVENT_TYPES.ORDER_CREATED, { orderId, userId, data })` or `createPaymentEvent(...)`.

### Product & Search events — standalone schemas

```
{
  eventId:   string  (UUID v4 — auto-generated, NOT the same as correlationId)
  type:      string  (product.* or search.*)
  timestamp: string  (ISO 8601)
  payload: { ... }   (event-specific payload, field name is "payload", NOT "data")
}
```

Used for: `product.created`, `product.updated`, `product.deleted`, `search.executed`.
Created via: `createProductCreatedEvent(payload)`, `createProductUpdatedEvent(payload)`, `createProductDeletedEvent(payload)`, `createSearchExecutedEvent(payload)`.

Note: Product/search events have **no** `orderId`, `userId`, or `correlationId` fields.

## Exported API

### Constants

**`EVENT_TYPES`** — all event type strings as a `const` object:
- Order: `ORDER_CREATED`, `ORDER_CONFIRMED`, `ORDER_SHIPPED`, `ORDER_CANCELLED`, `ORDER_DELIVERED`, `ORDER_RETURN_REQUESTED`, `ORDER_RETURN_APPROVED`, `ORDER_RETURN_REJECTED`, `ORDER_RETURN_REFUNDED`
- Payment: `PAYMENT_AUTHORIZED`, `PAYMENT_FAILED`, `PAYMENT_REFUNDED`
- Product: `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`
- Search: `SEARCH_EXECUTED`

**`TOPICS`** — Kafka topic strings:
- `ORDER_EVENTS: 'order.events'`
- `PAYMENT_EVENTS: 'payment.events'`
- `PRODUCT_EVENTS: 'product.events'`
- `SEARCH_EVENTS: 'search.events'`

**`CONSUMER_GROUPS`** — Kafka consumer group strings:
- `NOTIFICATION_WORKER: 'notification-worker-group'`
- `PRODUCT_SERVICE: 'product-service-group'`
- `PAYMENT_SERVICE: 'payment-service-group'`
- `ORDER_SERVICE: 'order-service-group'`
- `ANALYTICS_SERVICE: 'analytics-service-group'`
- `SEARCH_INDEXER: 'search-indexer'` ← note: no `-group` suffix, unlike the others

### Schemas (Zod)

**`BaseEventSchema`** — base fields for order/payment events (type, orderId, userId, correlationId, timestamp). Note: `type` in `BaseEventSchema` is a `z.enum` of all order/payment event types only — product and search types are NOT in this enum.

**Order event schemas** (each extends `BaseEventSchema`):

| Schema | `data` fields |
|--------|--------------|
| `OrderCreatedSchema` | `items: OrderItem[]` (min 1), `totalAmount: number+`, `shippingAddress?: string` |
| `OrderConfirmedSchema` | `items: OrderItem[]` (min 1), `totalAmount: number+`, `paymentId?: string` |
| `OrderShippedSchema` | `trackingNumber?: string`, `carrier?: string`, `estimatedDelivery?: string` (ISO) |
| `OrderCancelledSchema` | `reason: string`, `cancelledBy: 'user'|'system'|'admin'`, `refundAmount?: number≥0`, `items?: OrderItem[]`, `totalAmount?: number+`, `previousStatus?: 'created'|'confirmed'` |
| `OrderDeliveredSchema` | `items: OrderItem[]` (min 1), `totalAmount: number+` |
| `OrderReturnRequestedSchema` | `category: string`, `reason?: string`, `items: OrderItem[]` (min 1), `totalAmount: number+` |
| `OrderReturnApprovedSchema` | `items: OrderItem[]` (min 1), `totalAmount: number+` |
| `OrderReturnRejectedSchema` | `adminReason: string` |
| `OrderReturnRefundedSchema` | `refundAmount: number+` |

**`OrderItemSchema`** — `{ productId: number+int, quantity: number+int, price: number+ }`

**Payment event schemas** (each extends `BaseEventSchema`):

| Schema | `data` fields |
|--------|--------------|
| `PaymentAuthorizedSchema` | `transactionId: string`, `amount: number+`, `currency: string` |
| `PaymentFailedSchema` | `reason: string`, `retryable: boolean` |
| `PaymentRefundedSchema` | `amount: number+`, `currency: string` |

**Product event schemas** (standalone, `payload` field not `data`):

| Schema | `payload` fields |
|--------|-----------------|
| `ProductCreatedSchema` | Full product: `id (UUID)`, `name`, `description`, `price`, `averageRating`, `categoryIds: string[]`, `categoryNames: string[]`, `tags: string[]`, `inStock: boolean`, `imageUrl?: string`, `createdAt`, `updatedAt` |
| `ProductUpdatedSchema` | Same as ProductCreatedSchema payload |
| `ProductDeletedSchema` | `id (UUID)`, `deletedAt (ISO)` |

**`SearchExecutedSchema`** (standalone, `payload` field):
- `query: string`, `resultCount: number`, `facetsApplied: Record<string, string[]>`, `userId?: string`, `responseTimeMs: number`

### Factory Functions

**`createOrderEvent(type, params)`** — Overloaded function with full TypeScript type inference. Accepts `{ orderId, userId, data, correlationId?, timestamp? }`. Auto-generates `correlationId` (UUID v4) and `timestamp` (ISO 8601) if omitted. Validates via Zod; **throws `ZodError`** on invalid input.

**`createPaymentEvent(type, params)`** — Same pattern as `createOrderEvent` but for payment events.

**`createProductCreatedEvent(payload)`**, **`createProductUpdatedEvent(payload)`**, **`createProductDeletedEvent(payload)`**, **`createSearchExecutedEvent(payload)`** — Auto-generate `eventId` and `timestamp`. **Throw `ZodError`** on invalid input.

**`validateEvent(event: unknown)`** — Universal safe validator. Dispatches on `event.type` to the correct schema. Returns `{ success: true, data: AllEvents }` or `{ success: false, error: Error }`. **Never throws**. Handles null/undefined/missing type gracefully. Use this in Kafka consumers where you want to log-and-skip invalid messages.

### Types

- `EventType`, `Topic`, `ConsumerGroup` (derived from `as const` objects via `typeof X[keyof typeof X]`)
- `BaseEvent`, `OrderItem`
- Per-event types: `OrderCreatedEvent`, `OrderConfirmedEvent`, ..., `PaymentAuthorizedEvent`, ..., `ProductCreatedEvent`, ..., `SearchExecutedEvent`
- Union types: `OrderEvent`, `PaymentEvent`, `ProductEvent`, `SearchEvent`, `AllEvents`
- `ValidationResult` — discriminated union of `{ success: true; data: AllEvents }` and `{ success: false; error: Error }`

## Patterns

### Schema Extension

Order/payment schemas use `BaseEventSchema.extend({ type: z.literal(EVENT_TYPES.X), data: DataSchema })`. The `type` field is narrowed from the base enum to a literal. This enables TypeScript discriminated union narrowing on `event.type`.

### Factory Function Overloads

`createOrderEvent` and `createPaymentEvent` use TypeScript function overloads to return the precise event type for each `EVENT_TYPES` constant. Callers get full type inference without casting.

### validateEvent Dispatch

`validateEvent` uses a `switch` on `event.type` to route to the correct schema. Unknown types return `{ success: false }`. The function wraps everything in try/catch so Zod parse errors are converted to the `ValidationResult` shape.

## Conventions

- All field names use camelCase: `orderId`, `totalAmount`, `correlationId`
- IDs are positive integers for order/payment events; UUIDs for product/search events
- Amounts must be positive numbers (no zero); `refundAmount` on `OrderCancelledSchema` uses `nonnegative` (zero allowed)
- Timestamps are ISO 8601 strings validated with `z.string().datetime()`
- Required strings use `z.string().min(1)` — empty strings are rejected
- Optional fields use `.optional()` (undefined allowed); no `.nullable()` — null values are not used
- Event type strings use dot notation: `order.created`, `payment.authorized`, `product.created`
- Constants use SCREAMING_SNAKE_CASE: `EVENT_TYPES`, `TOPICS`, `CONSUMER_GROUPS`

## Adding a New Event Type

1. Add the event type string to `EVENT_TYPES` in `src/events/base.ts`. If it's an order/payment event, also add it to the `z.enum` array in `BaseEventSchema`.
2. Create `src/events/your-event.ts` following the existing pattern.
3. Export schema and type from `src/index.ts`.
4. If order/payment: add an overload to `createOrderEvent`/`createPaymentEvent` in `src/helpers/create-event.ts` and add the case to both switches (`createOrderEvent` and `validateEvent`).
5. Add tests in `tests/`.
6. Run `npm run build` — consumers import from `dist/`.

## Commands

```bash
npm run build        # Compile TypeScript → dist/ (required before consumers can import)
npm run dev          # TypeScript compiler in watch mode
npm run typecheck    # Type-check without emitting (CI validation)
npm test             # Run Jest test suite
npm run test:watch   # Jest in watch mode
```

Coverage threshold: 80% for branches, functions, lines, and statements (enforced by Jest config).

## Dependencies

- **Runtime**: `zod ^3.22.0` only
- **No database, no Kafka, no HTTP** — pure schema/validation library
- **No external UUID library** — uses Node.js built-in `crypto.randomUUID`

## Boundaries

**Owns**: Event schema definitions, TypeScript types, factory functions, Kafka topic/consumer group constants.

**Does NOT own**: Kafka producers/consumers, message routing, business logic, service orchestration, database access, HTTP endpoints.

**Do NOT**:
- Add service-specific business logic to schemas
- Add runtime dependencies beyond `zod`
- Implement Kafka producers or consumers here
- Hardcode service URLs or infrastructure details
- Break backwards compatibility on published schemas without a version bump — all consuming services must be updated together
- Use `npm file:` references when consuming this package from services running in Docker (use GitHub package references instead)