# order-events-schemas

Shared TypeScript library for Kafka event schemas used across microservices in the e-commerce platform.

## Purpose

This library provides runtime-validated Zod schemas, TypeScript types, and helper functions for all event-driven communication between services. It ensures a single source of truth for event contracts and prevents schema drift between producers and consumers.

## Architecture Context

Part of the event-driven microservices architecture as defined in ADR-002. Services use Kafka for asynchronous communication, and this library guarantees type safety and runtime validation for all events.

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

## Event Structure

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

## Usage

### Installing the Library

```bash
npm install @florea-alex/order-events-schemas
```

### Producing Events (with validation)

```typescript
import { createOrderEvent, createPaymentEvent, EVENT_TYPES } from '@florea-alex/order-events-schemas';

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

## Event Schemas

### OrderCreatedEvent

```typescript
{
  type: 'order.created',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    items: Array<{
      productId: number,
      quantity: number,
      price: number
    }>,
    totalAmount: number,
    shippingAddress?: string
  }
}
```

### OrderConfirmedEvent

```typescript
{
  type: 'order.confirmed',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    items: Array<{ productId, quantity, price }>,
    totalAmount: number,
    paymentId?: string
  }
}
```

### OrderShippedEvent

```typescript
{
  type: 'order.shipped',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    trackingNumber?: string,
    carrier?: string,
    estimatedDelivery?: string  // ISO 8601
  }
}
```

### OrderCancelledEvent

```typescript
{
  type: 'order.cancelled',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    reason: string,
    cancelledBy: 'user' | 'system' | 'admin',
    refundAmount?: number
  }
}
```

### PaymentAuthorizedEvent

```typescript
{
  type: 'payment.authorized',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    transactionId: string,   // Non-empty string
    amount: number,          // Positive number
    currency: string         // Non-empty string
  }
}
```

### PaymentFailedEvent

```typescript
{
  type: 'payment.failed',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    reason: string,          // Non-empty string
    retryable: boolean
  }
}
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

- **Event naming**: Use dot notation (`order.created`, `payment.authorized`)
- **Field naming**: camelCase
- **Immutability**: Once published, event schemas should not break backwards compatibility
- **Versioning**: Bump version on any schema change; services must update dependency to use new schemas
