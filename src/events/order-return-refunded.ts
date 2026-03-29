import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for order.return_refunded event data
 */
const OrderReturnRefundedDataSchema = z.object({
  refundAmount: z.number().positive(),
  pointsRedeemed: z.number().int().nonnegative().optional(),
});

/**
 * Complete order.return_refunded event schema
 */
export const OrderReturnRefundedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_RETURN_REFUNDED),
  data: OrderReturnRefundedDataSchema,
});

export type OrderReturnRefundedEvent = z.infer<typeof OrderReturnRefundedSchema>;
