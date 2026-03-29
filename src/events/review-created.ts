import { randomUUID } from 'crypto';
import { z } from 'zod';
import { EVENT_TYPES } from './base';

/**
 * Schema for review.created event payload.
 * Uses the product.events topic (standalone envelope — no orderId/correlationId).
 */
const ReviewCreatedPayloadSchema = z.object({
  reviewId: z.number().int().positive(),
  productId: z.number().int().positive(),
  userId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  timestamp: z.string().datetime(),
});

/**
 * Complete review.created event schema.
 * Follows product events pattern: { eventId, type, timestamp, payload }.
 */
export const ReviewCreatedSchema = z.object({
  eventId: z.string().uuid(),
  type: z.literal(EVENT_TYPES.REVIEW_CREATED),
  timestamp: z.string().datetime(),
  payload: ReviewCreatedPayloadSchema,
});

export type ReviewCreatedEvent = z.infer<typeof ReviewCreatedSchema>;

/**
 * Factory function for review.created events.
 * Auto-generates eventId (UUID v4) and timestamp (ISO 8601).
 * Throws ZodError if payload validation fails.
 */
export function createReviewCreatedEvent(
  payload: ReviewCreatedEvent['payload']
): ReviewCreatedEvent {
  return ReviewCreatedSchema.parse({
    eventId: randomUUID(),
    type: EVENT_TYPES.REVIEW_CREATED,
    timestamp: new Date().toISOString(),
    payload,
  });
}
