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

// validateEvent handles all event families: order, payment, product, search
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
    case EVENT_TYPES.PRODUCT_CREATED:
      console.log('Product created:', event.payload.name);
      break;
    case EVENT_TYPES.SEARCH_EXECUTED:
      console.log('Search query:', event.payload.query);
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
- `EVENT_TYPES.ORDER_DELIVERED` - Order delivered to customer
- `EVENT_TYPES.ORDER_RETURN_REQUESTED` - Customer requested return
- `EVENT_TYPES.ORDER_RETURN_APPROVED` - Return approved by admin
- `EVENT_TYPES.ORDER_RETURN_REJECTED` - Return rejected by admin
- `EVENT_TYPES.ORDER_RETURN_REFUNDED` - Return refund processed

### Payment Events

- `EVENT_TYPES.PAYMENT_AUTHORIZED` - Payment successfully authorized
- `EVENT_TYPES.PAYMENT_FAILED` - Payment authorization failed
- `EVENT_TYPES.PAYMENT_REFUNDED` - Payment refunded

### Review Events (product.events topic)

- `EVENT_TYPES.REVIEW_CREATED` - Product review submitted by a user

## Topics and Consumer Groups

```typescript
// Kafka Topics
TOPICS.ORDER_EVENTS        // 'order.events'
TOPICS.PAYMENT_EVENTS      // 'payment.events'
TOPICS.PRODUCT_EVENTS      // 'product.events' (product.* and review.* events)
TOPICS.SEARCH_EVENTS       // 'search.events'

// Consumer Groups
CONSUMER_GROUPS.NOTIFICATION_WORKER  // 'notification-worker-group'
CONSUMER_GROUPS.PRODUCT_SERVICE      // 'product-service-group'
CONSUMER_GROUPS.PAYMENT_SERVICE      // 'payment-service-group'
CONSUMER_GROUPS.ORDER_SERVICE        // 'order-service-group'
CONSUMER_GROUPS.ANALYTICS_SERVICE    // 'analytics-service-group'
CONSUMER_GROUPS.SEARCH_INDEXER       // 'search-indexer'
CONSUMER_GROUPS.LOYALTY_SERVICE      // 'loyalty-service-group'
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

Universal validation function that handles all event families (order, payment, product, search). Discriminates on the `type` field to route to the correct schema. Returns a result without throwing.

**Returns**: `ValidationResult`
- Success: `{ success: true, data: ValidatedEvent }`
- Failure: `{ success: false, error: Error }`

**Example**:
```typescript
const result = validateEvent(unknownEvent);

if (result.success) {
  const event = result.data; // Typed as AllEvents (order | payment | product | search)

  switch (event.type) {
    case EVENT_TYPES.ORDER_CREATED:
      console.log('Order items:', event.data.items);
      break;
    case EVENT_TYPES.PRODUCT_CREATED:
      console.log('Product created:', event.payload.name);
      break;
    case EVENT_TYPES.SEARCH_EXECUTED:
      console.log('Search query:', event.payload.query);
      break;
  }
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
  ProductCreatedEvent,
  ReviewCreatedEvent,
  SearchExecutedEvent,
  OrderEvent,
  PaymentEvent,
  ProductEvent,
  SearchEvent,
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

Current version: **0.4.0**

### Changelog

- **0.4.0**: Added `review.created` event type with `ReviewCreatedSchema` + `createReviewCreatedEvent` factory. Added `CONSUMER_GROUPS.LOYALTY_SERVICE`. Extended `OrderCreatedSchema` with optional loyalty points fields (`pointsRedeemed`, `pointsDiscountAmount`, `pointsRedemptionRate`). Extended `OrderDeliveredSchema` with optional `total` field. Extended `OrderCancelledSchema` and `OrderReturnRefundedSchema` with optional `pointsRedeemed` field.
- **0.3.1**: Extended `OrderCreatedSchema` with optional coupon/discount fields (`couponCode`, `discountType`, `discountValue`, `discountAmount`, `subtotal`).
- **0.3.0**: Unified validateEvent to handle all event families (order, payment, product, search). Added ProductEvent and SearchEvent union types. Widened AllEvents to include all event families.
- **0.2.0**: Added return & refund event schemas (order.delivered, order.return_requested, order.return_approved, order.return_rejected, order.return_refunded, payment.refunded)
- **0.1.0**: Added payment event schemas, new topics, new consumer groups
- **0.0.1**: Initial release with order event schemas
