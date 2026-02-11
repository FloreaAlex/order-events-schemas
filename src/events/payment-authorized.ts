import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for payment.authorized event data
 */
const PaymentAuthorizedDataSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
});

/**
 * Complete payment.authorized event schema
 */
export const PaymentAuthorizedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.PAYMENT_AUTHORIZED),
  data: PaymentAuthorizedDataSchema,
});

export type PaymentAuthorizedEvent = z.infer<typeof PaymentAuthorizedSchema>;
