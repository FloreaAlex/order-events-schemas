import { randomUUID } from 'crypto';
import { z } from 'zod';
import { EVENT_TYPES } from './base';

/**
 * Schema for search.executed event payload
 */
const SearchExecutedPayloadSchema = z.object({
  query: z.string(),
  resultCount: z.number(),
  facetsApplied: z.record(z.string(), z.array(z.string())),
  userId: z.string().optional(),
  responseTimeMs: z.number(),
});

/**
 * Schema for search.executed event
 */
export const SearchExecutedSchema = z.object({
  eventId: z.string().uuid(),
  type: z.literal(EVENT_TYPES.SEARCH_EXECUTED),
  timestamp: z.string().datetime(),
  payload: SearchExecutedPayloadSchema,
});

export type SearchExecutedEvent = z.infer<typeof SearchExecutedSchema>;

/**
 * Factory function for search.executed events.
 * Auto-generates eventId (UUID v4) and timestamp (ISO 8601).
 * Throws ZodError if payload validation fails.
 */
export function createSearchExecutedEvent(
  payload: SearchExecutedEvent['payload']
): SearchExecutedEvent {
  return SearchExecutedSchema.parse({
    eventId: randomUUID(),
    type: EVENT_TYPES.SEARCH_EXECUTED,
    timestamp: new Date().toISOString(),
    payload,
  });
}
