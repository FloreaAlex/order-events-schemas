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

**Purpose**: Shared npm package (@florea-alex/order-events-schemas) containing Zod schemas, event type constants, topic/consumer group constants, and helper functions for all order lifecycle Kafka events. Used by Order Service, Product Service, Notification Worker, and Payment Service.

**Tech Stack**: 
- TypeScript 5.3+ (compiled to CommonJS)
- Zod 3.22 (runtime schema validation)
- Jest 29.7 (testing framework)
- ts-jest 29.1 (TypeScript testing)

**Architecture**: Shared library with typed exports, modular event schemas, and factory functions

**Key Directories**:
- `src/` - Source code
  - `src/events/` - Event schemas (base, order-created, order-confirmed, order-shipped, order-cancelled, order-delivered, order-return-requested, order-return-approved, order-return-rejected, order-return-refunded, payment-authorized, payment-failed, payment-refunded, product-events, search-events)
  - `src/helpers/` - Factory and validation helper functions
  - `src/topics.ts` - Kafka topic and consumer group constants
- `tests/` - Jest test suite with comprehensive schema validation tests (175+ tests)
- `dist/` - Compiled output (CommonJS module)

## Dependencies

**Runtime Dependencies**:
- `zod` ^3.22.0 - Runtime schema validation

**Development Dependencies**:
- `@types/jest` ^29.5.0
- `@types/node` ^20.0.0
- `jest` ^29.7.0
- `ts-jest` ^29.1.0
- `typescript` ^5.3.3

**Message Queues**: 
- Kafka topics: `order.events`, `payment.events`
- Consumer groups: `notification-worker-group`, `product-service-group`, `payment-service-group`, `order-service-group`, `analytics-service-group`

**Databases**: None (library does not interact with databases)

**External APIs**: None (library provides schemas for other services)

## API Contracts

### Exported Constants

**EVENT_TYPES**:
- `ORDER_CREATED: 'order.created'`
- `ORDER_CONFIRMED: 'order.confirmed'`
- `ORDER_SHIPPED: 'order.shipped'`
- `ORDER_CANCELLED: 'order.cancelled'`
- `ORDER_DELIVERED: 'order.delivered'`
- `ORDER_RETURN_REQUESTED: 'order.return_requested'`
- `ORDER_RETURN_APPROVED: 'order.return_approved'`
- `ORDER_RETURN_REJECTED: 'order.return_rejected'`
- `ORDER_RETURN_REFUNDED: 'order.return_refunded'`
- `PAYMENT_AUTHORIZED: 'payment.authorized'`
- `PAYMENT_FAILED: 'payment.failed'`
- `PAYMENT_REFUNDED: 'payment.refunded'`

**TOPICS**:
- `ORDER_EVENTS: 'order.events'`
- `PAYMENT_EVENTS: 'payment.events'`

**CONSUMER_GROUPS**:
- `NOTIFICATION_WORKER: 'notification-worker-group'`
- `PRODUCT_SERVICE: 'product-service-group'`
- `PAYMENT_SERVICE: 'payment-service-group'`
- `ORDER_SERVICE: 'order-service-group'`
- `ANALYTICS_SERVICE: 'analytics-service-group'`

### Exported Schemas

**Base Schema**: `BaseEventSchema` (type, orderId, userId, correlationId, timestamp)

**Order Event Schemas**:
- `OrderItemSchema` - Product item schema
- `OrderCreatedSchema` - order.created event
- `OrderConfirmedSchema` - order.confirmed event
- `OrderShippedSchema` - order.shipped event
- `OrderCancelledSchema` - order.cancelled event — data: reason (string), cancelledBy (user|system|admin), refundAmount? (number), items? (OrderItem[]), totalAmount? (number), previousStatus? ('created'|'confirmed')
- `OrderDeliveredSchema` - order.delivered event — data: items (OrderItem[]), totalAmount (number)
- `OrderReturnRequestedSchema` - order.return_requested event — data: category (string), reason? (string), items (OrderItem[]), totalAmount (number)
- `OrderReturnApprovedSchema` - order.return_approved event — data: items (OrderItem[]), totalAmount (number)
- `OrderReturnRejectedSchema` - order.return_rejected event — data: adminReason (string)
- `OrderReturnRefundedSchema` - order.return_refunded event — data: refundAmount (number)

**Payment Event Schemas**:
- `PaymentAuthorizedSchema` - payment.authorized event
- `PaymentFailedSchema` - payment.failed event
- `PaymentRefundedSchema` - payment.refunded event — data: amount (number), currency (string)

### Exported Helper Functions

**createOrderEvent(type, params)**: Factory function for creating order events with validation. Auto-generates correlationId (UUID v4) and timestamp (ISO 8601) if not provided. Throws ZodError on validation failure.

**createPaymentEvent(type, params)**: Factory function for creating payment events with validation. Auto-generates correlationId and timestamp if not provided. Throws ZodError on validation failure.

**validateEvent(event)**: Safe validation function that returns `{ success: boolean, data?, error? }` without throwing. Validates any event against its appropriate schema based on the event type.

### Exported Types

**Base Types**: `EventType`, `BaseEvent`, `OrderItem`, `Topic`, `ConsumerGroup`

**Event Types**: `OrderCreatedEvent`, `OrderConfirmedEvent`, `OrderShippedEvent`, `OrderCancelledEvent`, `OrderDeliveredEvent`, `OrderReturnRequestedEvent`, `OrderReturnApprovedEvent`, `OrderReturnRejectedEvent`, `OrderReturnRefundedEvent`, `PaymentAuthorizedEvent`, `PaymentFailedEvent`, `PaymentRefundedEvent`

**Union Types**: `OrderEvent`, `PaymentEvent`, `AllEvents`

**Utility Types**: `ValidationResult`

### Events Published

This library does not publish events itself. It provides schemas and helpers for services to publish events to:
- `order.events` topic: order.created, order.confirmed, order.shipped, order.cancelled, order.delivered, order.return_requested, order.return_approved, order.return_rejected, order.return_refunded
- `payment.events` topic: payment.authorized, payment.failed, payment.refunded

### Events Consumed

This library does not consume events. It provides validation schemas for services that consume events from the topics listed above.

## Conventions

### Event Structure
All events follow a common base structure with type-specific data payloads. Base fields are validated using `BaseEventSchema`, and each event type extends this with specific data requirements.

### Field Validation Rules
- **IDs**: Positive integers (orderId, userId, productId)
- **Amounts**: Positive numbers (totalAmount, price, amount, refundAmount)
- **Quantities**: Positive integers
- **Strings**: Non-empty minimum length 1 for required strings (transactionId, currency, reason)
- **UUIDs**: correlationId must be valid UUID v4 format
- **Timestamps**: ISO 8601 datetime format

### Naming Conventions
- Event types use dot notation: `order.created`, `payment.authorized`
- Field names use camelCase: `orderId`, `userId`, `correlationId`
- Constants use SCREAMING_SNAKE_CASE: `EVENT_TYPES`, `TOPICS`, `CONSUMER_GROUPS`

### Versioning Strategy
Once published, event schemas should maintain backwards compatibility. Version bumps required for any schema changes. Services must update their dependency to use new schemas.

## Boundaries & Constraints

✅ **Responsibilities**:
- Define and export Zod schemas for all order and payment events
- Provide TypeScript types inferred from schemas for type safety
- Export constants for event types, Kafka topics, and consumer groups
- Offer factory functions for event creation with auto-generated fields (correlationId, timestamp)
- Provide safe validation function for runtime event validation
- Maintain backwards compatibility for published schemas

❌ **NOT Responsible For**:
- Producing or consuming Kafka messages (handled by individual services)
- Business logic or event processing workflows
- Database operations or persistence
- Authentication or authorization
- Service orchestration or communication
- Kafka broker configuration or infrastructure

🚫 **Do NOT**:
- Add service-specific business logic to schemas (keep schemas generic and reusable)
- Break schema compatibility without a versioning strategy
- Include secrets, credentials, or environment-specific configuration
- Add dependencies beyond schema validation (keep library lightweight)
- Hardcode service URLs or infrastructure details
- Implement Kafka producers or consumers in this library

---

*This file was auto-generated by Atelier. Update it as the component evolves.*