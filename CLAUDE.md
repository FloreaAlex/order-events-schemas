# Order Events Schemas

## System Architecture Overview

**Workspace**: Archmap Test Platform
**Architecture Style**: Microservices with event-driven communication
**This Component's Role**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, and Notification Worker.
**Component Type**: library
**Position in Flow**: Receives from: Order Service (other), Product Service (other), Notification Worker (other)

**Related Components**:
  - ← **Order Service** (service) - other
  - ← **Product Service** (service) - other
  - ← **Notification Worker** (worker) - other

## Patterns

### Schema Validation with Zod
All event structures use Zod schemas for runtime validation. Base schema defines common fields (type, orderId, userId, correlationId, timestamp), extended by specific event schemas. Helper functions (`createOrderEvent`, `validateEvent`) provide factory and validation patterns with type-safe interfaces.

### Event-Driven Architecture
Defines contracts for Kafka-based order lifecycle events. Topics and consumer groups are exported as typed constants to ensure consistency across services.

## Component Details

**Purpose**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, and Notification Worker.

**Tech Stack**: 
- TypeScript 5.3+
- Zod 3.22 (runtime schema validation)
- Jest (testing)

**Architecture**: Shared library with typed exports

**Key Directories**:
- `src/` - Source code
  - `src/events/` - Event schemas (base, order-created, order-confirmed, order-shipped, order-cancelled)
  - `src/helpers/` - Factory and validation helper functions
  - `src/topics.ts` - Kafka topic and consumer group constants
- `tests/` - Jest test suite with comprehensive schema validation tests
- `dist/` - Compiled output (CommonJS module)

## Dependencies

**Runtime Dependencies**:
- `zod` ^3.22.0 - Runtime schema validation

**Message Queues**: 
- Kafka topics: `order.events`
- Consumer groups: `notification-worker-group`, `product-service-group`

## API Contracts

### Events Published/Consumed
This library defines schemas for the following Kafka events on topic `order.events`:

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

### Exported API

**Constants**:
- `EVENT_TYPES` - Event type string constants
- `TOPICS` - Kafka topic names
- `CONSUMER_GROUPS` - Kafka consumer group names

**Schemas**:
- `BaseEventSchema` - Base event structure
- `OrderCreatedSchema`, `OrderConfirmedSchema`, `OrderShippedSchema`, `OrderCancelledSchema` - Specific event schemas
- `OrderItemSchema` - Order item structure

**Types**:
- `EventType`, `BaseEvent`, `OrderItem`
- `OrderCreatedEvent`, `OrderConfirmedEvent`, `OrderShippedEvent`, `OrderCancelledEvent`
- `OrderEvent` - Union of all order events
- `ValidationResult` - Result type for validation

**Helpers**:
- `createOrderEvent(type, params)` - Factory function with auto-generated correlationId/timestamp
- `validateEvent(event)` - Safe validation returning `{ success, data?, error? }`

## Conventions

### Event Structure
- All events extend `BaseEventSchema` with common fields
- `correlationId` is UUID v4 format
- `timestamp` is ISO 8601 datetime string
- Event types use dot notation: `order.created`, `order.confirmed`, etc.

### Schema Validation
- Use `createOrderEvent()` for creating events (throws ZodError on validation failure)
- Use `validateEvent()` for safe validation without throwing (returns `{ success: boolean, data?, error? }`)
- Positive integers for IDs (orderId, userId, productId)
- Positive numbers for monetary amounts and quantities

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
```