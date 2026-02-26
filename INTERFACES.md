# Interfaces Documentation

## Events / Message Queues

| Action | Topic/Queue | Event Type | Payload | Description |
|--------|-------------|------------|---------|-------------|
| publish | order.events | order.created | { items: OrderItem[], totalAmount: number, shippingAddress?: string } | New order placed with items, total amount, and optional shipping address |
| publish | order.events | order.confirmed | { items: OrderItem[], totalAmount: number, paymentId?: string } | Payment verified and order confirmed with optional payment ID |
| publish | order.events | order.shipped | { trackingNumber?: string, carrier?: string, estimatedDelivery?: string } | Order dispatched with optional tracking information |
| publish | order.events | order.cancelled | { reason: string, cancelledBy: 'user'\|'system'\|'admin', refundAmount?: number, items?: OrderItem[], totalAmount?: number, previousStatus?: 'created'\|'confirmed' } | Order cancelled with reason, cancellation source, optional refund, optional items/total for restoration context, and optional previous status for inventory management |
| publish | order.events | order.delivered | { items: OrderItem[], totalAmount: number } | Order delivered to customer with items and total |
| publish | order.events | order.return_requested | { category: string, reason?: string, items: OrderItem[], totalAmount: number } | Customer requested return with category, optional reason, items, and total |
| publish | order.events | order.return_approved | { items: OrderItem[], totalAmount: number } | Return approved — items included for Product Service inventory restoration |
| publish | order.events | order.return_rejected | { adminReason: string } | Return rejected by admin with reason |
| publish | order.events | order.return_refunded | { refundAmount: number } | Return refund processed with refund amount |
| publish | payment.events | payment.authorized | { transactionId: string, amount: number, currency: string } | Payment successfully authorized with transaction details |
| publish | payment.events | payment.failed | { reason: string, retryable: boolean } | Payment authorization failed with failure reason and retry flag |
| publish | payment.events | payment.refunded | { amount: number, currency: string } | Payment refunded with amount and currency |
| publish | product.events | product.created | { id: UUID, name: string, description: string, price: number, averageRating: number, categoryIds: string[], categoryNames: string[], tags: string[], inStock: boolean, imageUrl?: string, createdAt: ISO string, updatedAt: ISO string } | Product created — full document for search indexing |
| publish | product.events | product.updated | { id: UUID, name: string, description: string, price: number, averageRating: number, categoryIds: string[], categoryNames: string[], tags: string[], inStock: boolean, imageUrl?: string, createdAt: ISO string, updatedAt: ISO string } | Product updated — full document for search re-indexing |
| publish | product.events | product.deleted | { id: UUID, deletedAt: ISO string } | Product deleted — ID only, consumers remove the document |
| publish | search.events | search.executed | { query: string, resultCount: number, facetsApplied: Record<string, string[]>, userId?: string, responseTimeMs: number } | Search query executed — used for analytics aggregation |

## Exports

| Name | Kind | Description |
|------|------|-------------|
| EVENT_TYPES | constant | Event type string constants (ORDER_CREATED, ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_CANCELLED, ORDER_DELIVERED, ORDER_RETURN_REQUESTED, ORDER_RETURN_APPROVED, ORDER_RETURN_REJECTED, ORDER_RETURN_REFUNDED, PAYMENT_AUTHORIZED, PAYMENT_FAILED, PAYMENT_REFUNDED, PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED, SEARCH_EXECUTED) |
| TOPICS | constant | Kafka topic name constants (ORDER_EVENTS: 'order.events', PAYMENT_EVENTS: 'payment.events', PRODUCT_EVENTS: 'product.events', SEARCH_EVENTS: 'search.events') |
| CONSUMER_GROUPS | constant | Kafka consumer group name constants (NOTIFICATION_WORKER, PRODUCT_SERVICE, PAYMENT_SERVICE, ORDER_SERVICE, ANALYTICS_SERVICE, SEARCH_INDEXER: 'search-indexer') |
| BaseEventSchema | schema | Zod schema for base event structure with common fields (type, orderId, userId, correlationId, timestamp) |
| OrderItemSchema | schema | Zod schema for order item (productId, quantity, price) |
| OrderCreatedSchema | schema | Zod schema for order.created event |
| OrderConfirmedSchema | schema | Zod schema for order.confirmed event |
| OrderShippedSchema | schema | Zod schema for order.shipped event |
| OrderCancelledSchema | schema | Zod schema for order.cancelled event |
| OrderDeliveredSchema | schema | Zod schema for order.delivered event |
| OrderReturnRequestedSchema | schema | Zod schema for order.return_requested event |
| OrderReturnApprovedSchema | schema | Zod schema for order.return_approved event |
| OrderReturnRejectedSchema | schema | Zod schema for order.return_rejected event |
| OrderReturnRefundedSchema | schema | Zod schema for order.return_refunded event |
| PaymentAuthorizedSchema | schema | Zod schema for payment.authorized event |
| PaymentFailedSchema | schema | Zod schema for payment.failed event |
| PaymentRefundedSchema | schema | Zod schema for payment.refunded event |
| ProductCreatedSchema | schema | Zod schema for product.created event (eventId, type, timestamp, payload with full product data) |
| ProductUpdatedSchema | schema | Zod schema for product.updated event (same payload structure as ProductCreatedSchema) |
| ProductDeletedSchema | schema | Zod schema for product.deleted event (eventId, type, timestamp, payload: { id, deletedAt }) |
| SearchExecutedSchema | schema | Zod schema for search.executed event (eventId, type, timestamp, payload: { query, resultCount, facetsApplied, userId?, responseTimeMs }) |
| createOrderEvent | function | Factory function to create and validate order events with auto-generated correlationId and timestamp |
| createPaymentEvent | function | Factory function to create and validate payment events with auto-generated correlationId and timestamp |
| validateEvent | function | Safe validation function that returns { success, data?, error? } without throwing |
| createProductCreatedEvent | function | Factory function for product.created — takes payload, auto-generates eventId (UUID v4) and timestamp |
| createProductUpdatedEvent | function | Factory function for product.updated — takes payload, auto-generates eventId (UUID v4) and timestamp |
| createProductDeletedEvent | function | Factory function for product.deleted — takes { id, deletedAt } payload, auto-generates eventId and timestamp |
| createSearchExecutedEvent | function | Factory function for search.executed — takes payload, auto-generates eventId (UUID v4) and timestamp |
| EventType | type | Union type of all event type strings |
| BaseEvent | type | Base event structure with common fields |
| OrderItem | type | Order item structure (productId, quantity, price) |
| OrderCreatedEvent | type | Complete order.created event type |
| OrderConfirmedEvent | type | Complete order.confirmed event type |
| OrderShippedEvent | type | Complete order.shipped event type |
| OrderCancelledEvent | type | Complete order.cancelled event type |
| OrderDeliveredEvent | type | Complete order.delivered event type |
| OrderReturnRequestedEvent | type | Complete order.return_requested event type |
| OrderReturnApprovedEvent | type | Complete order.return_approved event type |
| OrderReturnRejectedEvent | type | Complete order.return_rejected event type |
| OrderReturnRefundedEvent | type | Complete order.return_refunded event type |
| PaymentAuthorizedEvent | type | Complete payment.authorized event type |
| PaymentFailedEvent | type | Complete payment.failed event type |
| PaymentRefundedEvent | type | Complete payment.refunded event type |
| ProductCreatedEvent | type | Complete product.created event type |
| ProductUpdatedEvent | type | Complete product.updated event type |
| ProductDeletedEvent | type | Complete product.deleted event type |
| SearchExecutedEvent | type | Complete search.executed event type |
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