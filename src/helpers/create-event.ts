import { randomUUID } from 'crypto';
import { EVENT_TYPES, EventType } from '../events/base';
import { OrderCreatedSchema, OrderCreatedEvent } from '../events/order-created';
import { OrderConfirmedSchema, OrderConfirmedEvent } from '../events/order-confirmed';
import { OrderShippedSchema, OrderShippedEvent } from '../events/order-shipped';
import { OrderCancelledSchema, OrderCancelledEvent } from '../events/order-cancelled';
import { PaymentAuthorizedSchema, PaymentAuthorizedEvent } from '../events/payment-authorized';
import { PaymentFailedSchema, PaymentFailedEvent } from '../events/payment-failed';

export type OrderEvent = OrderCreatedEvent | OrderConfirmedEvent | OrderShippedEvent | OrderCancelledEvent;
export type PaymentEvent = PaymentAuthorizedEvent | PaymentFailedEvent;
export type AllEvents = OrderEvent | PaymentEvent;

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

interface CreatePaymentAuthorizedParams extends BaseEventParams {
  data: PaymentAuthorizedEvent['data'];
}

interface CreatePaymentFailedParams extends BaseEventParams {
  data: PaymentFailedEvent['data'];
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
export function createOrderEvent(
  type: EventType,
  params: CreateOrderCreatedParams | CreateOrderConfirmedParams | CreateOrderShippedParams | CreateOrderCancelledParams
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
export function createPaymentEvent(
  type: EventType,
  params: CreatePaymentAuthorizedParams | CreatePaymentFailedParams
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

      case EVENT_TYPES.PAYMENT_AUTHORIZED:
        validatedEvent = PaymentAuthorizedSchema.parse(event);
        break;

      case EVENT_TYPES.PAYMENT_FAILED:
        validatedEvent = PaymentFailedSchema.parse(event);
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
