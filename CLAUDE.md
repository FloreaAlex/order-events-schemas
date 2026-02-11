# Order Events Schemas

## System Architecture Overview

**Workspace**: Archmap Test Platform
**Architecture Style**: Microservices with event-driven communication
**This Component's Role**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, Notification Worker, and Payment Service.
**Component Type**: library
**Position in Flow**: Receives from: Order Service (other), Product Service (other), Notification Worker (other), Payment Service (other)

**Related Components**:
  - ← **Order Service** (service) - other
  - ← **Product Service** (service) - other
  - ← **Notification Worker** (worker) - other
  - ← **Payment Service** (service) - other

## Purpose

This library provides runtime-validated Zod schemas, TypeScript types, and helper functions for all event-driven communication between services. It ensures a single source of truth for event contracts and prevents schema drift between producers and consumers.

Part of the event-driven microservices architecture as defined in ADR-002. Services use Kafka for asynchronous communication, and this library guarantees type safety and runtime validation for all events.

## Patterns

### Schema Validation with Zod
All event structures use Zod schemas for runtime validation. Base schema defines common fields (type, orderId, userId, correlationId, timestamp), extended by specific event schemas. Helper functions (`createOrderEvent`, `createPaymentEvent`, `validateEvent`) provide factory and validation patterns with type-safe interfaces.

### Event-Driven Architecture
Defines contracts for Kafka-based order lifecycle events. Topics and consumer groups are exported as typed constants to ensure consistency across services.

## Component Details

**Tech Stack**:
- TypeScript 5.3+
- Zod 3.22 (runtime schema validation)
- Jest (testing)

**Architecture**: Shared library with typed exports

**Key Directories**:
- `src/` - Source code
  - `src/events/` - Event schemas (base, order-created, order-confirmed, order-shipped, order-cancelled, payment-authorized, payment-failed)
  - `src/helpers/` - Factory and validation helper functions
  - `src/topics.ts` - Kafka topic and consumer group constants
- `tests/` - Jest test suite with comprehensive schema validation tests (64+ tests)
- `dist/` - Compiled output (CommonJS module)

## Events Catalog

### Order Events (Topic: `order.events`)

| Event Type | Description | Producer | Consumers |
|------------|-------------|----------|-----------|
| `order.created` | New order placed | Order Service | Notification Worker, Product Service |
| `order.confirmed` | Payment verified, order confirmed | Order Service | Notification Worker, Product Service |
| `order.shipped` | Order dispatched for delivery | Order Service | Notification Worker |
| `order.cancelled` | Order cancelled by user/system/admin | Order Service | Notification Worker |

### Payment Events (Topic: `payment.events`)

| Event Type | Description | Producer | Consumers |
|------------|-------------|----------|-----------|
| `payment.authorized` | Payment successfully authorized | Payment Service | Order Service, Notification Worker |
| `payment.failed` | Payment authorization failed | Payment Service | Order Service, Notification Worker |

## Kafka Topics

```typescript
TOPICS.ORDER_EVENTS = 'order.events'
TOPICS.PAYMENT_EVENTS = 'payment.events'
```

## Consumer Groups

```typescript
CONSUMER_GROUPS.NOTIFICATION_WORKER = 'notification-worker-group'
CONSUMER_GROUPS.PRODUCT_SERVICE = 'product-service-group'
CONSUMER_GROUPS.PAYMENT_SERVICE = 'payment-service-group'
CONSUMER_GROUPS.ORDER_SERVICE = 'order-service-group'
```

## Dependencies

**Runtime Dependencies**:
- `zod` ^3.22.0 - Runtime schema validation

**Message Queues**:
- Kafka topics: `order.events`, `payment.events`
- Consumer groups: `notification-worker-group`, `product-service-group`, `payment-service-group`, `order-service-group`

## API Contracts

### Event Structure

All events extend the base schema with common fields:

```typescript
{
  type: string,              // Event type (e.g., 'order.created', 'payment.authorized')
  orderId: number,           // Order ID (positive integer)
  userId: number,            // User ID (positive integer)
  correlationId: string,     // UUID v4 for distributed tracing
  timestamp: string,         // ISO 8601 datetime
  data: object               // Event-specific payload
}
```

### Events Published/Consumed

#### Order Events

**order.created**
- Fields: type, orderId, userId, correlationId, timestamp, data
- Data: items (OrderItem[]), totalAmount, shippingAddress (optional)
- Published by: Order Service
- Consumed by: Product Service, Notification Worker

**order.confirmed**
- Fields: type, orderId, userId, correlationId, timestamp, data
- Data: items (OrderItem[]), totalAmount, paymentId (optional)
- Published by: Order Service
- Consumed by: Notification Worker

**order.shipped**
- Fields: type, orderId, userId, correlationId, timestamp, data
- Data: trackingNumber (optional), carrier (optional), estimatedDelivery (optional)
- Published by: Order Service
- Consumed by: Notification Worker

**order.cancelled**
- Fields: type, orderId, userId, correlationId, timestamp, data
- Data: reason, cancelledBy ('user'|'system'|'admin'), refundAmount (optional)
- Published by: Order Service
- Consumed by: Product Service, Notification Worker

#### Payment Events

**payment.authorized**
- Fields: type, orderId, userId, correlationId, timestamp, data
- Data: transactionId (non-empty string), amount (positive number), currency (non-empty string)
- Published by: Payment Service
- Consumed by: Order Service, Notification Worker

**payment.failed**
- Fields: type, orderId, userId, correlationId, timestamp, data
- Data: reason (non-empty string), retryable (boolean)
- Published by: Payment Service
- Consumed by: Order Service, Notification Worker

### Exported API

**Constants**:
- `EVENT_TYPES` - Event type string constants
- `TOPICS` - Kafka topic names
- `CONSUMER_GROUPS` - Kafka consumer group names

**Schemas**:
- `BaseEventSchema` - Base event structure
- `OrderCreatedSchema`, `OrderConfirmedSchema`, `OrderShippedSchema`, `OrderCancelledSchema` - Specific order event schemas
- `PaymentAuthorizedSchema`, `PaymentFailedSchema` - Specific payment event schemas
- `OrderItemSchema` - Order item structure

**Types**:
- `EventType`, `BaseEvent`, `OrderItem`
- `OrderCreatedEvent`, `OrderConfirmedEvent`, `OrderShippedEvent`, `OrderCancelledEvent`
- `PaymentAuthorizedEvent`, `PaymentFailedEvent`
- `OrderEvent` - Union of all order events
- `PaymentEvent` - Union of all payment events
- `ValidationResult` - Result type for validation

**Helpers**:
- `createOrderEvent(type, params)` - Factory function with auto-generated correlationId/timestamp
- `createPaymentEvent(type, params)` - Factory function for payment events with auto-generated correlationId/timestamp
- `validateEvent(event)` - Safe validation returning `{ success, data?, error? }`

## Usage

### Installing the Library

```bash
npm install @florea-alex/order-events-schemas
```

### Producing Events (with validation)

```typescript
import { createOrderEvent, createPaymentEvent, EVENT_TYPES, TOPICS } from '@florea-alex/order-events-schemas';

// Creating an order event (throws ZodError if invalid)
const orderEvent = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
  orderId: 123,
  userId: 456,
  data: {
    items: [
      { productId: 1, quantity: 2, price: 19.99 }
    ],
    totalAmount: 39.98,
    shippingAddress: '123 Main St',
  },
  // correlationId and timestamp are auto-generated if not provided
});

// Creating a payment event
const paymentEvent = createPaymentEvent(EVENT_TYPES.PAYMENT_AUTHORIZED, {
  orderId: 123,
  userId: 456,
  data: {
    transactionId: 'txn_abc123',
    amount: 39.98,
    currency: 'USD',
  },
});

// Publish to Kafka
await producer.send({
  topic: TOPICS.ORDER_EVENTS,
  messages: [{ value: JSON.stringify(orderEvent) }],
});
```

### Consuming Events (with validation)

```typescript
import { validateEvent, EVENT_TYPES } from '@florea-alex/order-events-schemas';

// In Kafka consumer handler
consumer.on('message', (message) => {
  const parsed = JSON.parse(message.value);
  const result = validateEvent(parsed);

  if (!result.success) {
    console.error('Invalid event:', result.error);
    return;
  }

  // Type-safe access to validated event
  const event = result.data;

  switch (event.type) {
    case EVENT_TYPES.ORDER_CREATED:
      // event.data is typed as OrderCreatedEvent['data']
      handleOrderCreated(event);
      break;

    case EVENT_TYPES.PAYMENT_AUTHORIZED:
      // event.data is typed as PaymentAuthorizedEvent['data']
      handlePaymentAuthorized(event);
      break;
  }
});
```

## Validation Rules

- **orderId**: Positive integer
- **userId**: Positive integer
- **correlationId**: UUID v4 format
- **timestamp**: ISO 8601 datetime format
- **amount**: Positive number (> 0)
- **quantity**: Positive integer (> 0)
- **price**: Positive number (> 0)
- **items**: Non-empty array
- **transactionId**: Non-empty string (min length 1)
- **currency**: Non-empty string (min length 1)
- **reason** (payment failures, order cancellations): Non-empty string (min length 1)

## Development

### Build

```bash
npm run build
```

Compiles TypeScript to CommonJS in `dist/` directory.

### Test

```bash
npm test
```

Runs Jest test suite with 64+ tests covering:
- Schema validation (valid + invalid cases)
- Event creation helpers
- Edge cases and error handling

### Type Checking

```bash
npm run typecheck
```

## Version History

- **0.1.0**: Added payment event schemas (`payment.authorized`, `payment.failed`), new topics (`TOPICS.PAYMENT_EVENTS`), new consumer groups (`CONSUMER_GROUPS.PAYMENT_SERVICE`, `CONSUMER_GROUPS.ORDER_SERVICE`), and `createPaymentEvent()` helper
- **0.0.1**: Initial release with order event schemas

## Conventions

### Event Structure
- All events extend `BaseEventSchema` with common fields
- `correlationId` is UUID v4 format
- `timestamp` is ISO 8601 datetime string
- Event types use dot notation: `order.created`, `order.confirmed`, `payment.authorized`, etc.
- Field naming: camelCase

### Schema Validation
- Use `createOrderEvent()` or `createPaymentEvent()` for creating events (throws ZodError on validation failure)
- Use `validateEvent()` for safe validation without throwing (returns `{ success: boolean, data?, error? }`)
- Positive integers for IDs (orderId, userId, productId)
- Positive numbers for monetary amounts and quantities

### Versioning
- Once published, event schemas should not break backwards compatibility
- Bump version on any schema change; services must update dependency to use new schemas

## Boundaries & Constraints

✅ **Responsibilities**:
- Define and export event schemas with runtime validation
- Provide type-safe constants for topics, consumer groups, and event types
- Offer helper functions for event creation and validation
- Maintain backwards compatibility for event structure changes

❌ **NOT Responsible For**:
- Producing or consuming Kafka messages (handled by services)
- Business logic or event processing
- Database operations or persistence
- Authentication or authorization

🚫 **Do NOT**:
- Add service-specific logic (keep schemas generic and reusable)
- Break schema compatibility without versioning strategy
- Include secrets or environment-specific configuration
- Add dependencies beyond schema validation (keep lightweight)

---

*This file was auto-generated by Atelier. Update it as the component evolves.*
