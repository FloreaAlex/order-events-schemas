import { randomUUID } from 'crypto';
import { EVENT_TYPES, EventType } from '../events/base';
import { OrderCreatedSchema, OrderCreatedEvent } from '../events/order-created';
import { OrderConfirmedSchema, OrderConfirmedEvent } from '../events/order-confirmed';
import { OrderShippedSchema, OrderShippedEvent } from '../events/order-shipped';
import { OrderCancelledSchema, OrderCancelledEvent } from '../events/order-cancelled';
import { OrderDeliveredSchema, OrderDeliveredEvent } from '../events/order-delivered';
import { OrderReturnRequestedSchema, OrderReturnRequestedEvent } from '../events/order-return-requested';
import { OrderReturnApprovedSchema, OrderReturnApprovedEvent } from '../events/order-return-approved';
import { OrderReturnRejectedSchema, OrderReturnRejectedEvent } from '../events/order-return-rejected';
import { OrderReturnRefundedSchema, OrderReturnRefundedEvent } from '../events/order-return-refunded';
import { PaymentAuthorizedSchema, PaymentAuthorizedEvent } from '../events/payment-authorized';
import { PaymentFailedSchema, PaymentFailedEvent } from '../events/payment-failed';
import { PaymentRefundedSchema, PaymentRefundedEvent } from '../events/payment-refunded';
import { ProductCreatedSchema, ProductCreatedEvent, ProductUpdatedSchema, ProductUpdatedEvent, ProductDeletedSchema, ProductDeletedEvent } from '../events/product-events';
import { ReviewCreatedSchema, ReviewCreatedEvent } from '../events/review-created';
import { SearchExecutedSchema, SearchExecutedEvent } from '../events/search-events';

export type OrderEvent = OrderCreatedEvent | OrderConfirmedEvent | OrderShippedEvent | OrderCancelledEvent | OrderDeliveredEvent | OrderReturnRequestedEvent | OrderReturnApprovedEvent | OrderReturnRejectedEvent | OrderReturnRefundedEvent;
export type PaymentEvent = PaymentAuthorizedEvent | PaymentFailedEvent | PaymentRefundedEvent;
export type ProductEvent = ProductCreatedEvent | ProductUpdatedEvent | ProductDeletedEvent | ReviewCreatedEvent;
export type SearchEvent = SearchExecutedEvent;
export type AllEvents = OrderEvent | PaymentEvent | ProductEvent | SearchEvent;

interface BaseEventParams {
  orderId: number;
  userId: number;
  correlationId?: string;
  timestamp?: string;
}

interface CreateOrderCreatedParams extends BaseEventParams {
  data: OrderCreatedEvent['data'];
}

interface CreateOrderConfirmedParams extends BaseEventParams {
  data: OrderConfirmedEvent['data'];
}

interface CreateOrderShippedParams extends BaseEventParams {
  data: OrderShippedEvent['data'];
}

interface CreateOrderCancelledParams extends BaseEventParams {
  data: OrderCancelledEvent['data'];
}

interface CreateOrderDeliveredParams extends BaseEventParams {
  data: OrderDeliveredEvent['data'];
}

interface CreateOrderReturnRequestedParams extends BaseEventParams {
  data: OrderReturnRequestedEvent['data'];
}

interface CreateOrderReturnApprovedParams extends BaseEventParams {
  data: OrderReturnApprovedEvent['data'];
}

interface CreateOrderReturnRejectedParams extends BaseEventParams {
  data: OrderReturnRejectedEvent['data'];
}

interface CreateOrderReturnRefundedParams extends BaseEventParams {
  data: OrderReturnRefundedEvent['data'];
}

interface CreatePaymentAuthorizedParams extends BaseEventParams {
  data: PaymentAuthorizedEvent['data'];
}

interface CreatePaymentFailedParams extends BaseEventParams {
  data: PaymentFailedEvent['data'];
}

interface CreatePaymentRefundedParams extends BaseEventParams {
  data: PaymentRefundedEvent['data'];
}

/**
 * Factory function to create and validate order events
 * Auto-generates correlationId and timestamp if not provided
 * Throws ZodError if validation fails
 */
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_CREATED, params: CreateOrderCreatedParams): OrderCreatedEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_CONFIRMED, params: CreateOrderConfirmedParams): OrderConfirmedEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_SHIPPED, params: CreateOrderShippedParams): OrderShippedEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_CANCELLED, params: CreateOrderCancelledParams): OrderCancelledEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_DELIVERED, params: CreateOrderDeliveredParams): OrderDeliveredEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_RETURN_REQUESTED, params: CreateOrderReturnRequestedParams): OrderReturnRequestedEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_RETURN_APPROVED, params: CreateOrderReturnApprovedParams): OrderReturnApprovedEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_RETURN_REJECTED, params: CreateOrderReturnRejectedParams): OrderReturnRejectedEvent;
export function createOrderEvent(type: typeof EVENT_TYPES.ORDER_RETURN_REFUNDED, params: CreateOrderReturnRefundedParams): OrderReturnRefundedEvent;
export function createOrderEvent(
  type: EventType,
  params: CreateOrderCreatedParams | CreateOrderConfirmedParams | CreateOrderShippedParams | CreateOrderCancelledParams | CreateOrderDeliveredParams | CreateOrderReturnRequestedParams | CreateOrderReturnApprovedParams | CreateOrderReturnRejectedParams | CreateOrderReturnRefundedParams
): OrderEvent {
  const { orderId, userId, data, correlationId, timestamp } = params;

  // Build base event
  const baseEvent = {
    type,
    orderId,
    userId,
    correlationId: correlationId ?? randomUUID(),
    timestamp: timestamp ?? new Date().toISOString(),
    data,
  };

  // Validate against the appropriate schema based on event type
  switch (type) {
    case EVENT_TYPES.ORDER_CREATED:
      return OrderCreatedSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_CONFIRMED:
      return OrderConfirmedSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_SHIPPED:
      return OrderShippedSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_CANCELLED:
      return OrderCancelledSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_DELIVERED:
      return OrderDeliveredSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_RETURN_REQUESTED:
      return OrderReturnRequestedSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_RETURN_APPROVED:
      return OrderReturnApprovedSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_RETURN_REJECTED:
      return OrderReturnRejectedSchema.parse(baseEvent);

    case EVENT_TYPES.ORDER_RETURN_REFUNDED:
      return OrderReturnRefundedSchema.parse(baseEvent);

    default:
      throw new Error(`Unknown event type: ${type}`);
  }
}

/**
 * Factory function to create and validate payment events
 * Auto-generates correlationId and timestamp if not provided
 * Throws ZodError if validation fails
 */
export function createPaymentEvent(type: typeof EVENT_TYPES.PAYMENT_AUTHORIZED, params: CreatePaymentAuthorizedParams): PaymentAuthorizedEvent;
export function createPaymentEvent(type: typeof EVENT_TYPES.PAYMENT_FAILED, params: CreatePaymentFailedParams): PaymentFailedEvent;
export function createPaymentEvent(type: typeof EVENT_TYPES.PAYMENT_REFUNDED, params: CreatePaymentRefundedParams): PaymentRefundedEvent;
export function createPaymentEvent(
  type: EventType,
  params: CreatePaymentAuthorizedParams | CreatePaymentFailedParams | CreatePaymentRefundedParams
): PaymentEvent {
  const { orderId, userId, data, correlationId, timestamp } = params;

  // Build base event
  const baseEvent = {
    type,
    orderId,
    userId,
    correlationId: correlationId ?? randomUUID(),
    timestamp: timestamp ?? new Date().toISOString(),
    data,
  };

  // Validate against the appropriate schema based on event type
  switch (type) {
    case EVENT_TYPES.PAYMENT_AUTHORIZED:
      return PaymentAuthorizedSchema.parse(baseEvent);

    case EVENT_TYPES.PAYMENT_FAILED:
      return PaymentFailedSchema.parse(baseEvent);

    case EVENT_TYPES.PAYMENT_REFUNDED:
      return PaymentRefundedSchema.parse(baseEvent);

    default:
      throw new Error(`Unknown event type: ${type}`);
  }
}

export type ValidationResult =
  | { success: true; data: AllEvents; error?: undefined }
  | { success: false; data?: undefined; error: Error };

/**
 * Validates an event object against its schema
 * Returns { success: true, data } on success
 * Returns { success: false, error } on failure
 * Handles null/undefined/missing type gracefully
 */
export function validateEvent(event: unknown): ValidationResult {
  try {
    // Handle null/undefined/missing type
    if (!event || typeof event !== 'object') {
      return {
        success: false,
        error: new Error('Event must be a non-null object'),
      };
    }

    // Type guard to check for 'type' property
    if (!('type' in event)) {
      return {
        success: false,
        error: new Error('Event type is required'),
      };
    }

    const eventWithType = event as { type: unknown };

    if (!eventWithType.type) {
      return {
        success: false,
        error: new Error('Event type is required'),
      };
    }

    // Validate based on event type
    let validatedEvent: AllEvents;

    switch (eventWithType.type) {
      case EVENT_TYPES.ORDER_CREATED:
        validatedEvent = OrderCreatedSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_CONFIRMED:
        validatedEvent = OrderConfirmedSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_SHIPPED:
        validatedEvent = OrderShippedSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_CANCELLED:
        validatedEvent = OrderCancelledSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_DELIVERED:
        validatedEvent = OrderDeliveredSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_RETURN_REQUESTED:
        validatedEvent = OrderReturnRequestedSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_RETURN_APPROVED:
        validatedEvent = OrderReturnApprovedSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_RETURN_REJECTED:
        validatedEvent = OrderReturnRejectedSchema.parse(event);
        break;

      case EVENT_TYPES.ORDER_RETURN_REFUNDED:
        validatedEvent = OrderReturnRefundedSchema.parse(event);
        break;

      case EVENT_TYPES.PAYMENT_AUTHORIZED:
        validatedEvent = PaymentAuthorizedSchema.parse(event);
        break;

      case EVENT_TYPES.PAYMENT_FAILED:
        validatedEvent = PaymentFailedSchema.parse(event);
        break;

      case EVENT_TYPES.PAYMENT_REFUNDED:
        validatedEvent = PaymentRefundedSchema.parse(event);
        break;

      case EVENT_TYPES.PRODUCT_CREATED:
        validatedEvent = ProductCreatedSchema.parse(event);
        break;

      case EVENT_TYPES.PRODUCT_UPDATED:
        validatedEvent = ProductUpdatedSchema.parse(event);
        break;

      case EVENT_TYPES.PRODUCT_DELETED:
        validatedEvent = ProductDeletedSchema.parse(event);
        break;

      case EVENT_TYPES.REVIEW_CREATED:
        validatedEvent = ReviewCreatedSchema.parse(event);
        break;

      case EVENT_TYPES.SEARCH_EXECUTED:
        validatedEvent = SearchExecutedSchema.parse(event);
        break;

      default:
        return {
          success: false,
          error: new Error(`Unknown event type: ${eventWithType.type}`),
        };
    }

    return {
      success: true,
      data: validatedEvent,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Validation failed'),
    };
  }
}
