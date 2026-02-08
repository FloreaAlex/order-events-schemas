import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for order.shipped event data
 */
const OrderShippedDataSchema = z.object({
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
});

/**
 * Complete order.shipped event schema
 */
export const OrderShippedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_SHIPPED),
  data: OrderShippedDataSchema,
});

export type OrderShippedEvent = z.infer<typeof OrderShippedSchema>;
