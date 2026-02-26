import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';
import { OrderItemSchema } from './order-created';

/**
 * Schema for order.delivered event data
 */
const OrderDeliveredDataSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().positive(),
});

/**
 * Complete order.delivered event schema
 */
export const OrderDeliveredSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_DELIVERED),
  data: OrderDeliveredDataSchema,
});

export type OrderDeliveredEvent = z.infer<typeof OrderDeliveredSchema>;
