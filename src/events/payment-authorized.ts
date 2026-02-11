import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for payment.authorized event data
 */
const PaymentAuthorizedDataSchema = z.object({
  transactionId: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
});

/**
 * Complete payment.authorized event schema
 */
export const PaymentAuthorizedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.PAYMENT_AUTHORIZED),
  data: PaymentAuthorizedDataSchema,
});

export type PaymentAuthorizedEvent = z.infer<typeof PaymentAuthorizedSchema>;
