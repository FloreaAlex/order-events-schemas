import { randomUUID } from 'crypto';
import { z } from 'zod';
import { EVENT_TYPES } from './base';

/**
 * Shared payload schema for product.created and product.updated events.
 * Includes full product data so consumers (e.g. Search Indexer) can index
 * without additional lookups.
 */
const ProductPayloadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  averageRating: z.number(),
  categoryIds: z.array(z.string()),
  categoryNames: z.array(z.string()),
  tags: z.array(z.string()),
  inStock: z.boolean(),
  imageUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Schema for product.created event
 */
export const ProductCreatedSchema = z.object({
  eventId: z.string().uuid(),
  type: z.literal(EVENT_TYPES.PRODUCT_CREATED),
  timestamp: z.string().datetime(),
  payload: ProductPayloadSchema,
});

export type ProductCreatedEvent = z.infer<typeof ProductCreatedSchema>;

/**
 * Schema for product.updated event — same payload as product.created
 */
export const ProductUpdatedSchema = z.object({
  eventId: z.string().uuid(),
  type: z.literal(EVENT_TYPES.PRODUCT_UPDATED),
  timestamp: z.string().datetime(),
  payload: ProductPayloadSchema,
});

export type ProductUpdatedEvent = z.infer<typeof ProductUpdatedSchema>;

/**
 * Schema for product.deleted event — only includes product ID and deletion time.
 * Consumers (e.g. Search Indexer) only need the ID to remove the document.
 */
const ProductDeletedPayloadSchema = z.object({
  id: z.string().uuid(),
  deletedAt: z.string().datetime(),
});

export const ProductDeletedSchema = z.object({
  eventId: z.string().uuid(),
  type: z.literal(EVENT_TYPES.PRODUCT_DELETED),
  timestamp: z.string().datetime(),
  payload: ProductDeletedPayloadSchema,
});

export type ProductDeletedEvent = z.infer<typeof ProductDeletedSchema>;

/**
 * Factory function for product.created events.
 * Auto-generates eventId (UUID v4) and timestamp (ISO 8601).
 * Throws ZodError if payload validation fails.
 */
export function createProductCreatedEvent(
  payload: ProductCreatedEvent['payload']
): ProductCreatedEvent {
  return ProductCreatedSchema.parse({
    eventId: randomUUID(),
    type: EVENT_TYPES.PRODUCT_CREATED,
    timestamp: new Date().toISOString(),
    payload,
  });
}

/**
 * Factory function for product.updated events.
 * Auto-generates eventId (UUID v4) and timestamp (ISO 8601).
 * Throws ZodError if payload validation fails.
 */
export function createProductUpdatedEvent(
  payload: ProductUpdatedEvent['payload']
): ProductUpdatedEvent {
  return ProductUpdatedSchema.parse({
    eventId: randomUUID(),
    type: EVENT_TYPES.PRODUCT_UPDATED,
    timestamp: new Date().toISOString(),
    payload,
  });
}

/**
 * Factory function for product.deleted events.
 * Auto-generates eventId (UUID v4) and timestamp (ISO 8601).
 * Throws ZodError if payload validation fails.
 */
export function createProductDeletedEvent(
  payload: ProductDeletedEvent['payload']
): ProductDeletedEvent {
  return ProductDeletedSchema.parse({
    eventId: randomUUID(),
    type: EVENT_TYPES.PRODUCT_DELETED,
    timestamp: new Date().toISOString(),
    payload,
  });
}
