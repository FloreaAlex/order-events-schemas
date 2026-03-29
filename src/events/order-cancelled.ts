import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';
import { OrderItemSchema } from './order-created';

/**
 * Schema for order.cancelled event data
 */
const OrderCancelledDataSchema = z.object({
  reason: z.string().min(1),
  cancelledBy: z.enum(['user', 'system', 'admin']),
  refundAmount: z.number().nonnegative().optional(),
  // Items and totalAmount were already being sent by Order Service — now formally defined
  items: z.array(OrderItemSchema).optional(),
  totalAmount: z.number().positive().optional(),
  // previousStatus tells consumers (e.g. Product Service) whether inventory needs restoration
  previousStatus: z.enum(['created', 'confirmed']).optional(),
  pointsRedeemed: z.number().int().nonnegative().optional(),
});

/**
 * Complete order.cancelled event schema
 */
export const OrderCancelledSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_CANCELLED),
  data: OrderCancelledDataSchema,
});

export type OrderCancelledEvent = z.infer<typeof OrderCancelledSchema>;
