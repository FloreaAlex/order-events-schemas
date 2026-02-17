# Interfaces Documentation

## Events / Message Queues

| Action | Topic/Queue | Event Type | Payload | Description |
|--------|-------------|------------|---------|-------------|
| publish | order.events | order.created | { items: OrderItem[], totalAmount: number, shippingAddress?: string } | New order placed with items, total amount, and optional shipping address |
| publish | order.events | order.confirmed | { items: OrderItem[], totalAmount: number, paymentId?: string } | Payment verified and order confirmed with optional payment ID |
| publish | order.events | order.shipped | { trackingNumber?: string, carrier?: string, estimatedDelivery?: string } | Order dispatched with optional tracking information |
| publish | order.events | order.cancelled | { reason: string, cancelledBy: 'user'\|'system'\|'admin', refundAmount?: number } | Order cancelled with reason, cancellation source, and optional refund amount |
| publish | payment.events | payment.authorized | { transactionId: string, amount: number, currency: string } | Payment successfully authorized with transaction details |
| publish | payment.events | payment.failed | { reason: string, retryable: boolean } | Payment authorization failed with failure reason and retry flag |

## Exports

| Name | Kind | Description |
|------|------|-------------|
| EVENT_TYPES | constant | Event type string constants (ORDER_CREATED, ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_CANCELLED, PAYMENT_AUTHORIZED, PAYMENT_FAILED) |
| TOPICS | constant | Kafka topic name constants (ORDER_EVENTS: 'order.events', PAYMENT_EVENTS: 'payment.events') |
| CONSUMER_GROUPS | constant | Kafka consumer group name constants (NOTIFICATION_WORKER, PRODUCT_SERVICE, PAYMENT_SERVICE, ORDER_SERVICE, ANALYTICS_SERVICE) |
| BaseEventSchema | schema | Zod schema for base event structure with common fields (type, orderId, userId, correlationId, timestamp) |
| OrderItemSchema | schema | Zod schema for order item (productId, quantity, price) |
| OrderCreatedSchema | schema | Zod schema for order.created event |
| OrderConfirmedSchema | schema | Zod schema for order.confirmed event |
| OrderShippedSchema | schema | Zod schema for order.shipped event |
| OrderCancelledSchema | schema | Zod schema for order.cancelled event |
| PaymentAuthorizedSchema | schema | Zod schema for payment.authorized event |
| PaymentFailedSchema | schema | Zod schema for payment.failed event |
| createOrderEvent | function | Factory function to create and validate order events with auto-generated correlationId and timestamp |
| createPaymentEvent | function | Factory function to create and validate payment events with auto-generated correlationId and timestamp |
| validateEvent | function | Safe validation function that returns { success, data?, error? } without throwing |
| EventType | type | Union type of all event type strings |
| BaseEvent | type | Base event structure with common fields |
| OrderItem | type | Order item structure (productId, quantity, price) |
| OrderCreatedEvent | type | Complete order.created event type |
| OrderConfirmedEvent | type | Complete order.confirmed event type |
| OrderShippedEvent | type | Complete order.shipped event type |
| OrderCancelledEvent | type | Complete order.cancelled event type |
| PaymentAuthorizedEvent | type | Complete payment.authorized event type |
| PaymentFailedEvent | type | Complete payment.failed event type |
| OrderEvent | type | Union type of all order events |
| PaymentEvent | type | Union type of all payment events |
| AllEvents | type | Union type of all events (order + payment) |
| ValidationResult | type | Result type for validateEvent function ({ success: true, data } or { success: false, error }) |
| Topic | type | Union type of all topic names |
| ConsumerGroup | type | Union type of all consumer group names |

## Environment

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| NODE_ENV | Node environment (development/production/test) | no | development |