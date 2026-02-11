# @florea-alex/order-events-schemas

Shared TypeScript library for Kafka event schemas with runtime validation using Zod.

## Installation

```bash
npm install @florea-alex/order-events-schemas
```

## Quick Start

### Producing Events

```typescript
import {
  createOrderEvent,
  createPaymentEvent,
  EVENT_TYPES,
  TOPICS
} from '@florea-alex/order-events-schemas';

// Create an order event with auto-generated correlationId and timestamp
const event = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
  orderId: 123,
  userId: 456,
  data: {
    items: [{ productId: 1, quantity: 2, price: 19.99 }],
    totalAmount: 39.98,
  },
});

// Create a payment event
const paymentEvent = createPaymentEvent(EVENT_TYPES.PAYMENT_AUTHORIZED, {
  orderId: 123,
  userId: 456,
  data: {
    transactionId: 'txn_abc123',
    amount: 39.98,
    currency: 'USD',
  },
});
```

### Consuming Events

```typescript
import { validateEvent, EVENT_TYPES } from '@florea-alex/order-events-schemas';

const result = validateEvent(incomingEvent);

if (result.success) {
  const event = result.data; // Fully typed event

  switch (event.type) {
    case EVENT_TYPES.ORDER_CREATED:
      console.log('Order created:', event.data.items);
      break;
    case EVENT_TYPES.PAYMENT_AUTHORIZED:
      console.log('Payment authorized:', event.data.transactionId);
      break;
  }
} else {
  console.error('Validation failed:', result.error.message);
}
```

## Available Events

### Order Events

- `EVENT_TYPES.ORDER_CREATED` - New order placed
- `EVENT_TYPES.ORDER_CONFIRMED` - Payment verified
- `EVENT_TYPES.ORDER_SHIPPED` - Order dispatched
- `EVENT_TYPES.ORDER_CANCELLED` - Order cancelled

### Payment Events

- `EVENT_TYPES.PAYMENT_AUTHORIZED` - Payment successfully authorized
- `EVENT_TYPES.PAYMENT_FAILED` - Payment authorization failed

## Topics and Consumer Groups

```typescript
// Kafka Topics
TOPICS.ORDER_EVENTS        // 'order.events'
TOPICS.PAYMENT_EVENTS      // 'payment.events'

// Consumer Groups
CONSUMER_GROUPS.NOTIFICATION_WORKER  // 'notification-worker-group'
CONSUMER_GROUPS.PRODUCT_SERVICE      // 'product-service-group'
CONSUMER_GROUPS.PAYMENT_SERVICE      // 'payment-service-group'
CONSUMER_GROUPS.ORDER_SERVICE        // 'order-service-group'
```

## API Reference

### `createOrderEvent(type, params)`

Creates and validates an order event. Auto-generates `correlationId` (UUID v4) and `timestamp` (ISO 8601) if not provided.

**Throws**: `ZodError` if validation fails

**Example**:
```typescript
const event = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
  orderId: 1,
  userId: 100,
  data: {
    items: [{ productId: 1, quantity: 1, price: 10 }],
    totalAmount: 10,
    shippingAddress: '123 Main St', // optional
  },
  correlationId: 'custom-uuid', // optional
  timestamp: '2026-02-11T12:00:00Z', // optional
});
```

### `createPaymentEvent(type, params)`

Creates and validates a payment event. Auto-generates `correlationId` and `timestamp` if not provided.

**Throws**: `ZodError` if validation fails

**Example**:
```typescript
const event = createPaymentEvent(EVENT_TYPES.PAYMENT_AUTHORIZED, {
  orderId: 1,
  userId: 100,
  data: {
    transactionId: 'txn_123',
    amount: 50.00,
    currency: 'USD',
  },
});
```

### `validateEvent(event)`

Validates an event object against its schema without throwing.

**Returns**: `ValidationResult`
- Success: `{ success: true, data: ValidatedEvent }`
- Failure: `{ success: false, error: Error }`

**Example**:
```typescript
const result = validateEvent(unknownEvent);

if (result.success) {
  console.log('Valid event:', result.data);
} else {
  console.error('Invalid event:', result.error.message);
}
```

## Event Schemas

### PaymentAuthorizedEvent

```typescript
{
  type: 'payment.authorized',
  orderId: number,           // Positive integer
  userId: number,            // Positive integer
  correlationId: string,     // UUID v4
  timestamp: string,         // ISO 8601 datetime
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

See [CLAUDE.md](./CLAUDE.md) for complete event catalog including order events.

## TypeScript Support

This library is written in TypeScript and provides full type definitions. All exported types are inferred from Zod schemas for maximum type safety.

```typescript
import type {
  OrderCreatedEvent,
  PaymentAuthorizedEvent,
  OrderEvent,
  PaymentEvent,
  AllEvents
} from '@florea-alex/order-events-schemas';
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Watch mode
npm run dev
```

## License

ISC

## Version

Current version: **0.1.0**

### Changelog

- **0.1.0**: Added payment event schemas, new topics, new consumer groups
- **0.0.1**: Initial release with order event schemas
