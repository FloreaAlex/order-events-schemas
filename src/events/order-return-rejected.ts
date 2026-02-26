import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for order.return_rejected event data
 */
const OrderReturnRejectedDataSchema = z.object({
  adminReason: z.string().min(1),
});

/**
 * Complete order.return_rejected event schema
 */
export const OrderReturnRejectedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_RETURN_REJECTED),
  data: OrderReturnRejectedDataSchema,
});

export type OrderReturnRejectedEvent = z.infer<typeof OrderReturnRejectedSchema>;
