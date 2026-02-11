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

// Payment authorized event
export { PaymentAuthorizedSchema } from './events/payment-authorized';
export type { PaymentAuthorizedEvent } from './events/payment-authorized';

// Payment failed event
export { PaymentFailedSchema } from './events/payment-failed';
export type { PaymentFailedEvent } from './events/payment-failed';

// Helper functions
export { createOrderEvent, createPaymentEvent, validateEvent } from './helpers/create-event';
export type { OrderEvent, PaymentEvent, AllEvents, ValidationResult } from './helpers/create-event';
