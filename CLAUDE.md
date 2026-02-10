# Order Events Schemas

## System Architecture Overview

**Workspace**: Default Workspace
**Architecture Style**: Microservices with event-driven communication
**This Component's Role**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, and Notification Worker.
**Component Type**: library
**Position in Flow**: Receives from: Order Service (other), Product Service (other), Notification Worker (other)

**Related Components**:
  - ← **Order Service** (service) - other
  - ← **Product Service** (service) - other
  - ← **Notification Worker** (worker) - other

## Patterns

### Event-Driven Architecture with Zod Validation
This library implements runtime schema validation using Zod for all Kafka events. Each event type has a dedicated schema that extends a base event schema, ensuring consistent validation across producers and consumers. The `createOrderEvent` factory function auto-generates UUIDs for correlation IDs and ISO 8601 timestamps, enforcing event structure at creation time.

### Factory Pattern for Event Creation
The `createOrderEvent` helper uses TypeScript function overloading to provide type-safe event creation. It automatically validates events against their Zod schemas at runtime and provides different return types based on the event type constant passed.

### Discriminated Union Types
All event types share a common base structure but use literal type discrimination on the `type` field, enabling type narrowing in TypeScript consumers. The `validateEvent` helper returns a discriminated union `ValidationResult` with `success: true/false` for safe error handling.

## Component Details

**Purpose**: Single source of truth for order lifecycle event contracts across all microservices.

**Tech Stack**: 
- TypeScript 5.3+
- Zod 3.22+ (runtime validation)
- Jest 29.7+ (testing)
- CommonJS module format

**Architecture**: Pure TypeScript library with no runtime dependencies except Zod. Exports schemas, types, constants, and helper functions.

**Key Directories**:
- `src/` - Source code
  - `src/events/` - Event schema definitions (base, order-created, order-confirmed, order-shipped, order-cancelled)
  - `src/helpers/` - Helper functions (createOrderEvent, validateEvent)
  - `src/topics.ts` - Kafka topic and consumer group constants
  - `src/index.ts` - Public API exports
- `tests/` - Jest test suite (42 tests, comprehensive coverage)
- `dist/` - Compiled JavaScript output (CommonJS)

## Dependencies

**Runtime Dependencies**: 
- Zod (schema validation)

**No Databases**: N/A - this is a pure library with no runtime infrastructure

**Message Queues**: 
- Defines constants for Kafka topics: `order.events`
- Defines consumer groups: `notification-worker-group`, `product-service-group`

**External APIs**: N/A

## API Contracts

### Exported Constants
- `EVENT_TYPES` - Order event type constants: `order.created`, `order.confirmed`, `order.shipped`, `order.cancelled`
- `TOPICS` - Kafka topic names: `order.events`
- `CONSUMER_GROUPS` - Kafka consumer group IDs: `notification-worker-group`, `product-service-group`

### Exported Schemas
- `BaseEventSchema` - Base fields for all events (type, orderId, userId, correlationId, timestamp)
- `OrderCreatedSchema` - Schema for order.created events
- `OrderConfirmedSchema` - Schema for order.confirmed events
- `OrderShippedSchema` - Schema for order.shipped events
- `OrderCancelledSchema` - Schema for order.cancelled events
- `OrderItemSchema` - Schema for order items (productId, quantity, price)

### Exported Types
- `OrderEvent` - Union of all order event types
- `OrderCreatedEvent`, `OrderConfirmedEvent`, `OrderShippedEvent`, `OrderCancelledEvent` - Individual event types
- `OrderItem` - Order item structure
- `ValidationResult` - Discriminated union for validation results

### Helper Functions
- `createOrderEvent(type, params)` - Factory function to create validated events with auto-generated correlationId/timestamp
- `validateEvent(event)` - Validates any event object and returns `{ success: true, data }` or `{ success: false, error }`

### Events Published
This library does not publish events itself. It defines the schemas for these events published by Order Service:
- `order.created` - New order created with items, totalAmount, optional shippingAddress
- `order.confirmed` - Order confirmed with items, totalAmount, optional paymentId
- `order.shipped` - Order shipped with optional trackingNumber, carrier, estimatedDelivery
- `order.cancelled` - Order cancelled with reason, cancelledBy (user/system/admin), optional refundAmount

### Events Consumed
This library does not consume events. It defines schemas consumed by:
- **Product Service** - Consumes `order.confirmed` to update inventory
- **Notification Worker** - Consumes all order events to send notifications

## Conventions

### Strict TypeScript Validation
All code uses TypeScript strict mode with comprehensive type checking. Event schemas leverage Zod's runtime validation combined with TypeScript's compile-time type inference using `z.infer<>`.

### Optional Parameter Defaults with Nullish Coalescing
Helper functions use the nullish coalescing operator (`??`) for optional parameters like `correlationId` and `timestamp`, only generating defaults when values are `null` or `undefined`, not when falsy values like empty strings are provided.

### Event Structure Standards
All events follow a consistent structure: base fields (type, orderId, userId, correlationId, timestamp) + event-specific `data` payload. CorrelationId is always a UUID v4, timestamp is always ISO 8601 format.

## Boundaries & Constraints

✅ **Responsibilities**:
- Define and validate Zod schemas for all order lifecycle events
- Export TypeScript types derived from schemas for compile-time safety
- Provide constants for Kafka topics and consumer groups
- Provide helper functions for creating and validating events
- Auto-generate correlationId (UUID) and timestamp (ISO 8601) when not provided
- Ensure runtime validation of all event payloads

❌ **NOT Responsible For**:
- Publishing events to Kafka (handled by Order Service)
- Consuming events from Kafka (handled by Product Service and Notification Worker)
- Business logic for order processing
- Database persistence
- Authentication or authorization
- Network communication or Kafka client configuration

🚫 **Do NOT**:
- Add service-specific logic or dependencies to this shared library
- Include Kafka client libraries or message queue implementations
- Add database models or ORM configurations
- Introduce breaking changes to existing event schemas without versioning strategy
- Use this library for non-order-related events (keep focused on order lifecycle only)

---

*This file was auto-generated by Atelier. Update it as the component evolves.*