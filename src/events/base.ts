import { z } from "zod";

/**
 * Event types enum - all possible order event types
 */
export const EVENT_TYPES = {
  ORDER_CREATED: "order.created",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_SHIPPED: "order.shipped",
  ORDER_CANCELLED: "order.cancelled",
  PAYMENT_AUTHORIZED: "payment.authorized",
  PAYMENT_FAILED: "payment.failed",
  // Product lifecycle event types (product.events topic)
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
  // Search analytics event type (search.events topic)
  SEARCH_EXECUTED: "search.executed",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * Base event schema - fields that all events must have
 */
export const BaseEventSchema = z.object({
  type: z.enum([
    EVENT_TYPES.ORDER_CREATED,
    EVENT_TYPES.ORDER_CONFIRMED,
    EVENT_TYPES.ORDER_SHIPPED,
    EVENT_TYPES.ORDER_CANCELLED,
    EVENT_TYPES.PAYMENT_AUTHORIZED,
    EVENT_TYPES.PAYMENT_FAILED,
  ]),
  orderId: z.number().int().positive(),
  userId: z.number().int().positive(),
  correlationId: z.string().uuid(),
  timestamp: z.string().datetime(),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
