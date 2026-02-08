import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for order.cancelled event data
 */
const OrderCancelledDataSchema = z.object({
  reason: z.string(),
  cancelledBy: z.enum(['user', 'system', 'admin']),
  refundAmount: z.number().nonnegative().optional(),
});

/**
 * Complete order.cancelled event schema
 */
export const OrderCancelledSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_CANCELLED),
  data: OrderCancelledDataSchema,
});

export type OrderCancelledEvent = z.infer<typeof OrderCancelledSchema>;
