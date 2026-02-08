import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';
import { OrderItemSchema } from './order-created';

/**
 * Schema for order.confirmed event data
 */
const OrderConfirmedDataSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().positive(),
  paymentId: z.string().optional(),
});

/**
 * Complete order.confirmed event schema
 */
export const OrderConfirmedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_CONFIRMED),
  data: OrderConfirmedDataSchema,
});

export type OrderConfirmedEvent = z.infer<typeof OrderConfirmedSchema>;
