// order-events-schemas
// Shared TypeScript library for Kafka event schemas

// Constants
export { TOPICS, CONSUMER_GROUPS } from './topics';
export type { Topic, ConsumerGroup } from './topics';

// Base event types and schemas
export { EVENT_TYPES, BaseEventSchema } from './events/base';
export type { EventType, BaseEvent } from './events/base';

// Order created event
export { OrderItemSchema, OrderCreatedSchema } from './events/order-created';
export type { OrderItem, OrderCreatedEvent } from './events/order-created';

// Order confirmed event
export { OrderConfirmedSchema } from './events/order-confirmed';
export type { OrderConfirmedEvent } from './events/order-confirmed';

// Order shipped event
export { OrderShippedSchema } from './events/order-shipped';
export type { OrderShippedEvent } from './events/order-shipped';

// Order cancelled event
export { OrderCancelledSchema } from './events/order-cancelled';
export type { OrderCancelledEvent } from './events/order-cancelled';

// Order delivered event
export { OrderDeliveredSchema } from './events/order-delivered';
export type { OrderDeliveredEvent } from './events/order-delivered';

// Order return requested event
export { OrderReturnRequestedSchema } from './events/order-return-requested';
export type { OrderReturnRequestedEvent } from './events/order-return-requested';

// Order return approved event
export { OrderReturnApprovedSchema } from './events/order-return-approved';
export type { OrderReturnApprovedEvent } from './events/order-return-approved';

// Order return rejected event
export { OrderReturnRejectedSchema } from './events/order-return-rejected';
export type { OrderReturnRejectedEvent } from './events/order-return-rejected';

// Order return refunded event
export { OrderReturnRefundedSchema } from './events/order-return-refunded';
export type { OrderReturnRefundedEvent } from './events/order-return-refunded';

// Payment authorized event
export { PaymentAuthorizedSchema } from './events/payment-authorized';
export type { PaymentAuthorizedEvent } from './events/payment-authorized';

// Payment failed event
export { PaymentFailedSchema } from './events/payment-failed';
export type { PaymentFailedEvent } from './events/payment-failed';

// Payment refunded event
export { PaymentRefundedSchema } from './events/payment-refunded';
export type { PaymentRefundedEvent } from './events/payment-refunded';

// Helper functions
export { createOrderEvent, createPaymentEvent, validateEvent } from './helpers/create-event';
export type { OrderEvent, PaymentEvent, ProductEvent, SearchEvent, AllEvents, ValidationResult } from './helpers/create-event';

// Product events (product.events topic)
export {
  ProductCreatedSchema,
  ProductUpdatedSchema,
  ProductDeletedSchema,
  createProductCreatedEvent,
  createProductUpdatedEvent,
  createProductDeletedEvent,
} from './events/product-events';
export type {
  ProductCreatedEvent,
  ProductUpdatedEvent,
  ProductDeletedEvent,
} from './events/product-events';

// Review events (product.events topic)
export { ReviewCreatedSchema, createReviewCreatedEvent } from './events/review-created';
export type { ReviewCreatedEvent } from './events/review-created';

// Search events (search.events topic)
export { SearchExecutedSchema, createSearchExecutedEvent } from './events/search-events';
export type { SearchExecutedEvent } from './events/search-events';
