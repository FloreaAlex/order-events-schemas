import { randomUUID } from 'crypto';
import {
  EVENT_TYPES,
  SearchExecutedSchema,
  createSearchExecutedEvent,
  validateEvent,
} from '../src';

const validSearchPayload = {
  query: 'wireless headphones',
  resultCount: 42,
  facetsApplied: {
    category: ['Electronics', 'Audio'],
    brand: ['Sony'],
  },
  userId: 'user-123',
  responseTimeMs: 87,
};

const minimalSearchPayload = {
  query: 'laptop',
  resultCount: 0,
  facetsApplied: {},
  responseTimeMs: 12,
};

describe('SearchExecutedSchema', () => {
  const validEvent = {
    eventId: randomUUID(),
    type: EVENT_TYPES.SEARCH_EXECUTED,
    timestamp: new Date().toISOString(),
    payload: validSearchPayload,
  };

  test('validates correct search.executed event', () => {
    expect(() => SearchExecutedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates search.executed event without optional userId', () => {
    const eventWithoutUser = {
      ...validEvent,
      payload: { ...validSearchPayload, userId: undefined },
    };
    expect(() => SearchExecutedSchema.parse(eventWithoutUser)).not.toThrow();
  });

  test('validates search.executed event with empty facetsApplied', () => {
    const eventWithEmptyFacets = {
      ...validEvent,
      payload: { ...validSearchPayload, facetsApplied: {} },
    };
    expect(() => SearchExecutedSchema.parse(eventWithEmptyFacets)).not.toThrow();
  });

  test('validates search.executed event with multiple facet values', () => {
    const eventWithFacets = {
      ...validEvent,
      payload: {
        ...validSearchPayload,
        facetsApplied: {
          category: ['Electronics', 'Audio', 'Headphones'],
          price: ['0-50', '50-100'],
          brand: ['Sony', 'Bose', 'JBL'],
        },
      },
    };
    expect(() => SearchExecutedSchema.parse(eventWithFacets)).not.toThrow();
  });

  test('rejects event with invalid eventId (not UUID)', () => {
    const invalidEvent = { ...validEvent, eventId: 'not-a-uuid' };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with wrong type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.PRODUCT_CREATED };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with invalid timestamp', () => {
    const invalidEvent = { ...validEvent, timestamp: 'not-a-date' };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing payload.query', () => {
    const { query: _omit, ...payloadWithoutQuery } = validSearchPayload;
    const invalidEvent = { ...validEvent, payload: payloadWithoutQuery };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing payload.resultCount', () => {
    const { resultCount: _omit, ...payloadWithoutCount } = validSearchPayload;
    const invalidEvent = { ...validEvent, payload: payloadWithoutCount };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing payload.responseTimeMs', () => {
    const { responseTimeMs: _omit, ...payloadWithoutMs } = validSearchPayload;
    const invalidEvent = { ...validEvent, payload: payloadWithoutMs };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing payload.facetsApplied', () => {
    const { facetsApplied: _omit, ...payloadWithoutFacets } = validSearchPayload;
    const invalidEvent = { ...validEvent, payload: payloadWithoutFacets };
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing eventId', () => {
    const { eventId: _omit, ...invalidEvent } = validEvent;
    expect(() => SearchExecutedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('createSearchExecutedEvent', () => {
  test('creates valid event with auto-generated eventId and timestamp', () => {
    const event = createSearchExecutedEvent(validSearchPayload);

    expect(event.type).toBe(EVENT_TYPES.SEARCH_EXECUTED);
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(event.payload).toEqual(validSearchPayload);
  });

  test('generates unique eventIds for each call', () => {
    const event1 = createSearchExecutedEvent(validSearchPayload);
    const event2 = createSearchExecutedEvent(validSearchPayload);
    expect(event1.eventId).not.toBe(event2.eventId);
  });

  test('creates event without optional userId', () => {
    const event = createSearchExecutedEvent(minimalSearchPayload);
    expect(event.type).toBe(EVENT_TYPES.SEARCH_EXECUTED);
    expect(event.payload.userId).toBeUndefined();
  });

  test('creates event with empty facetsApplied', () => {
    const event = createSearchExecutedEvent(minimalSearchPayload);
    expect(event.payload.facetsApplied).toEqual({});
  });

  test('creates event with zero resultCount', () => {
    const event = createSearchExecutedEvent({ ...validSearchPayload, resultCount: 0 });
    expect(event.payload.resultCount).toBe(0);
  });

  test('preserves all payload fields', () => {
    const event = createSearchExecutedEvent(validSearchPayload);
    expect(event.payload.query).toBe(validSearchPayload.query);
    expect(event.payload.resultCount).toBe(validSearchPayload.resultCount);
    expect(event.payload.facetsApplied).toEqual(validSearchPayload.facetsApplied);
    expect(event.payload.userId).toBe(validSearchPayload.userId);
    expect(event.payload.responseTimeMs).toBe(validSearchPayload.responseTimeMs);
  });

  test('throws ZodError for invalid payload (missing query)', () => {
    expect(() => {
      createSearchExecutedEvent({ ...validSearchPayload, query: undefined as unknown as string });
    }).toThrow();
  });

  test('throws ZodError for invalid payload (missing responseTimeMs)', () => {
    expect(() => {
      createSearchExecutedEvent({
        ...validSearchPayload,
        responseTimeMs: undefined as unknown as number,
      });
    }).toThrow();
  });
});

describe('validateEvent with search events', () => {
  test('returns success for valid search.executed event', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.SEARCH_EXECUTED,
      timestamp: new Date().toISOString(),
      payload: validSearchPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
    expect(result.error).toBeUndefined();
  });

  test('returns success for search.executed event without optional userId', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.SEARCH_EXECUTED,
      timestamp: new Date().toISOString(),
      payload: minimalSearchPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
  });

  test('returns success for search.executed event with empty facetsApplied', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.SEARCH_EXECUTED,
      timestamp: new Date().toISOString(),
      payload: { ...validSearchPayload, facetsApplied: {} },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns failure for search.executed event with invalid eventId', () => {
    const event = {
      eventId: 'not-a-uuid',
      type: EVENT_TYPES.SEARCH_EXECUTED,
      timestamp: new Date().toISOString(),
      payload: validSearchPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for search.executed event with missing payload', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.SEARCH_EXECUTED,
      timestamp: new Date().toISOString(),
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for search.executed event with missing query', () => {
    const { query: _omit, ...payloadWithoutQuery } = validSearchPayload;
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.SEARCH_EXECUTED,
      timestamp: new Date().toISOString(),
      payload: payloadWithoutQuery,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
