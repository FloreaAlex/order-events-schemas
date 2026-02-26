import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';
import { OrderItemSchema } from './order-created';

/**
 * Schema for order.return_requested event data
 */
const OrderReturnRequestedDataSchema = z.object({
  category: z.string().min(1),
  reason: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().positive(),
});

/**
 * Complete order.return_requested event schema
 */
export const OrderReturnRequestedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_RETURN_REQUESTED),
  data: OrderReturnRequestedDataSchema,
});

export type OrderReturnRequestedEvent = z.infer<typeof OrderReturnRequestedSchema>;
