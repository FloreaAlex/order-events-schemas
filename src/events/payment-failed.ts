import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for payment.failed event data
 */
const PaymentFailedDataSchema = z.object({
  reason: z.string().min(1),
  retryable: z.boolean(),
});

/**
 * Complete payment.failed event schema
 */
export const PaymentFailedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.PAYMENT_FAILED),
  data: PaymentFailedDataSchema,
});

export type PaymentFailedEvent = z.infer<typeof PaymentFailedSchema>;
