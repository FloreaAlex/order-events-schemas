import { z } from 'zod';
import { BaseEventSchema, EVENT_TYPES } from './base';

/**
 * Schema for order item in order.created event
 */
export const OrderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

/**
 * Schema for order.created event data
 */
const OrderCreatedDataSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  totalAmount: z.number().positive(),
  shippingAddress: z.string().optional(),
  couponCode: z.string().min(1).optional(),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().positive().optional(),
  discountAmount: z.number().nonnegative().optional(),
  subtotal: z.number().positive().optional(),
  pointsRedeemed: z.number().int().nonnegative().optional(),
  pointsDiscountAmount: z.number().nonnegative().optional(),
  pointsRedemptionRate: z.number().int().positive().optional(),
});

/**
 * Complete order.created event schema
 */
export const OrderCreatedSchema = BaseEventSchema.extend({
  type: z.literal(EVENT_TYPES.ORDER_CREATED),
  data: OrderCreatedDataSchema,
});

export type OrderCreatedEvent = z.infer<typeof OrderCreatedSchema>;
