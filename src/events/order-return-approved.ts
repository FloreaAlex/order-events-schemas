import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';
import { OrderItemSchema } from './order-created';

/**
 * Schema for order.return_approved event data
 */
const OrderReturnApprovedDataSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().positive(),
});

/**
 * Complete order.return_approved event schema
 */
export const OrderReturnApprovedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_RETURN_APPROVED),
  data: OrderReturnApprovedDataSchema,
});

export type OrderReturnApprovedEvent = z.infer<typeof OrderReturnApprovedSchema>;
