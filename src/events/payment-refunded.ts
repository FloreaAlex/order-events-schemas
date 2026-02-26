import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for payment.refunded event data
 */
const PaymentRefundedDataSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
});

/**
 * Complete payment.refunded event schema
 */
export const PaymentRefundedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.PAYMENT_REFUNDED),
  data: PaymentRefundedDataSchema,
});

export type PaymentRefundedEvent = z.infer<typeof PaymentRefundedSchema>;
