# order-events-schemas

Shared TypeScript library providing type-safe Kafka event schemas for order lifecycle events. This is the single source of truth for event contracts across all microservices (Order Service, Product Service, Notification Worker).

## Installation

```bash
npm install @florea-alex/order-events-schemas
```

## Features

- ✅ **Type-safe event schemas** using Zod for runtime validation
- ✅ **CommonJS modules** compatible with existing Node.js services
- ✅ **Auto-generated correlation IDs and timestamps**
- ✅ **Comprehensive test coverage** (80%+ coverage threshold)
- ✅ **Constants for topics and consumer groups**
- ✅ **Helper functions** for event creation and validation

## Usage

### Import Constants

```typescript
import { EVENT_TYPES, TOPICS, CONSUMER_GROUPS } from '@florea-alex/order-events-schemas';

console.log(TOPICS.ORDER_EVENTS); // 'order.events'
console.log(CONSUMER_GROUPS.NOTIFICATION_WORKER); // 'notification-worker-group'
console.log(EVENT_TYPES.ORDER_CREATED); // 'order.created'
```

### Creating Events

Use the `createOrderEvent` helper to create type-safe, validated events:

```typescript
import { createOrderEvent, EVENT_TYPES } from '@florea-alex/order-events-schemas';

// Create order.created event
const orderCreated = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
  orderId: 123,
  userId: 456,
  data: {
    items: [
      { productId: 1, quantity: 2, price: 19.99 },
      { productId: 2, quantity: 1, price: 9.99 }
    ],
    totalAmount: 49.97,
    shippingAddress: '123 Main St, City, State 12345'
  }
});
// Auto-generates correlationId (UUID) and timestamp (ISO 8601)

// Create order.confirmed event
const orderConfirmed = createOrderEvent(EVENT_TYPES.ORDER_CONFIRMED, {
  orderId: 123,
  userId: 456,
  data: {
    items: [{ productId: 1, quantity: 2, price: 19.99 }],
    totalAmount: 39.98,
    paymentId: 'pay_1234567890'
  }
});

// Create order.shipped event
const orderShipped = createOrderEvent(EVENT_TYPES.ORDER_SHIPPED, {
  orderId: 123,
  userId: 456,
  data: {
    trackingNumber: 'TRK123456789',
    carrier: 'FedEx',
    estimatedDelivery: '2026-02-15T10:00:00.000Z'
  }
});

// Create order.cancelled event
const orderCancelled = createOrderEvent(EVENT_TYPES.ORDER_CANCELLED, {
  orderId: 123,
  userId: 456,
  data: {
    reason: 'Customer requested cancellation',
    cancelledBy: 'user',
    refundAmount: 49.97
  }
});
```

### Validating Events

Use the `validateEvent` helper to validate incoming events:

```typescript
import { validateEvent } from '@florea-alex/order-events-schemas';

const result = validateEvent(someEvent);

if (result.success) {
  console.log('Valid event:', result.data);
  // result.data is the validated, typed event
} else {
  console.error('Validation failed:', result.error);
}
```

### Using Schemas Directly

If you need to validate using Zod schemas directly:

```typescript
import { OrderCreatedSchema } from '@florea-alex/order-events-schemas';

try {
  const event = OrderCreatedSchema.parse(rawEvent);
  // event is now typed as OrderCreatedEvent
} catch (error) {
  // Handle Zod validation error
}
```

### TypeScript Types

All event types are exported for use in your services:

```typescript
import type {
  OrderCreatedEvent,
  OrderConfirmedEvent,
  OrderShippedEvent,
  OrderCancelledEvent,
  OrderItem,
  BaseEvent
} from '@florea-alex/order-events-schemas';

function handleOrderCreated(event: OrderCreatedEvent) {
  // event.type is 'order.created'
  // event.data.items is OrderItem[]
  // Full type safety!
}
```

## Event Schemas

### order.created

Published when a new order is created.

```typescript
{
  type: 'order.created',
  orderId: number,      // positive integer
  userId: number,       // positive integer
  correlationId: string, // UUID
  timestamp: string,    // ISO 8601 datetime
  data: {
    items: Array<{      // min 1 item
      productId: number,  // positive integer
      quantity: number,   // positive integer
      price: number       // positive
    }>,
    totalAmount: number,  // positive
    shippingAddress?: string // optional
  }
}
```

### order.confirmed

Published when an order is confirmed and payment succeeds.

```typescript
{
  type: 'order.confirmed',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    items: Array<{ productId, quantity, price }>, // min 1
    totalAmount: number,  // positive
    paymentId?: string    // optional
  }
}
```

### order.shipped

Published when an order is shipped.

```typescript
{
  type: 'order.shipped',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    trackingNumber?: string,      // optional
    carrier?: string,             // optional
    estimatedDelivery?: string    // optional ISO 8601 datetime
  }
}
```

### order.cancelled

Published when an order is cancelled.

```typescript
{
  type: 'order.cancelled',
  orderId: number,
  userId: number,
  correlationId: string,
  timestamp: string,
  data: {
    reason: string,                           // required
    cancelledBy: 'user' | 'system' | 'admin', // required
    refundAmount?: number                     // optional, non-negative
  }
}
```

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm run dev
npm run test:watch
```

## Architecture

This library is part of the event-driven microservices architecture:

- **Order Service** (producer) - publishes all order lifecycle events
- **Product Service** (consumer) - consumes `order.confirmed` to update inventory
- **Notification Worker** (consumer) - consumes all order events to send notifications

See [ADR-002](./docs/adr-002-shared-event-schemas.md) for the architectural decision behind this shared library.

## License

MIT
