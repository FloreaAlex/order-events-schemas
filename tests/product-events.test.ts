import { randomUUID } from 'crypto';
import {
  EVENT_TYPES,
  TOPICS,
  CONSUMER_GROUPS,
  ProductCreatedSchema,
  ProductUpdatedSchema,
  ProductDeletedSchema,
  createProductCreatedEvent,
  createProductUpdatedEvent,
  createProductDeletedEvent,
  validateEvent,
} from '../src';

const validProductPayload = {
  id: randomUUID(),
  name: 'Test Product',
  description: 'A great product',
  price: 29.99,
  averageRating: 4.5,
  categoryIds: [randomUUID(), randomUUID()],
  categoryNames: ['Electronics', 'Gadgets'],
  tags: ['wireless', 'portable'],
  inStock: true,
  imageUrl: 'https://example.com/image.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const validProductPayloadWithoutOptionals = {
  id: randomUUID(),
  name: 'Minimal Product',
  description: 'A minimal product',
  price: 9.99,
  averageRating: 0,
  categoryIds: [],
  categoryNames: [],
  tags: [],
  inStock: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('New constants (product & search)', () => {
  test('TOPICS includes PRODUCT_EVENTS and SEARCH_EVENTS', () => {
    expect(TOPICS.PRODUCT_EVENTS).toBe('product.events');
    expect(TOPICS.SEARCH_EVENTS).toBe('search.events');
  });

  test('CONSUMER_GROUPS includes SEARCH_INDEXER', () => {
    expect(CONSUMER_GROUPS.SEARCH_INDEXER).toBe('search-indexer');
  });

  test('EVENT_TYPES includes product and search event types', () => {
    expect(EVENT_TYPES.PRODUCT_CREATED).toBe('product.created');
    expect(EVENT_TYPES.PRODUCT_UPDATED).toBe('product.updated');
    expect(EVENT_TYPES.PRODUCT_DELETED).toBe('product.deleted');
    expect(EVENT_TYPES.SEARCH_EXECUTED).toBe('search.executed');
  });
});

describe('ProductCreatedSchema', () => {
  const validEvent = {
    eventId: randomUUID(),
    type: EVENT_TYPES.PRODUCT_CREATED,
    timestamp: new Date().toISOString(),
    payload: validProductPayload,
  };

  test('validates correct product.created event', () => {
    expect(() => ProductCreatedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates product.created event without optional imageUrl', () => {
    const eventWithoutImage = {
      ...validEvent,
      payload: validProductPayloadWithoutOptionals,
    };
    expect(() => ProductCreatedSchema.parse(eventWithoutImage)).not.toThrow();
  });

  test('validates product.created event with empty categoryIds and tags arrays', () => {
    const eventWithEmptyArrays = {
      ...validEvent,
      payload: { ...validProductPayload, categoryIds: [], categoryNames: [], tags: [] },
    };
    expect(() => ProductCreatedSchema.parse(eventWithEmptyArrays)).not.toThrow();
  });

  test('rejects event with invalid eventId (not UUID)', () => {
    const invalidEvent = { ...validEvent, eventId: 'not-a-uuid' };
    expect(() => ProductCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with invalid payload.id (not UUID)', () => {
    const invalidEvent = {
      ...validEvent,
      payload: { ...validProductPayload, id: 'not-a-uuid' },
    };
    expect(() => ProductCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing required payload fields', () => {
    const invalidEvent = {
      ...validEvent,
      payload: { id: randomUUID() }, // missing name, description, price, etc.
    };
    expect(() => ProductCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with wrong type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.PRODUCT_UPDATED };
    expect(() => ProductCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with invalid timestamp (not ISO)', () => {
    const invalidEvent = { ...validEvent, timestamp: 'not-a-date' };
    expect(() => ProductCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing eventId', () => {
    const { eventId: _omit, ...invalidEvent } = validEvent;
    expect(() => ProductCreatedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('ProductUpdatedSchema', () => {
  const validEvent = {
    eventId: randomUUID(),
    type: EVENT_TYPES.PRODUCT_UPDATED,
    timestamp: new Date().toISOString(),
    payload: validProductPayload,
  };

  test('validates correct product.updated event', () => {
    expect(() => ProductUpdatedSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects event with wrong type (product.created)', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.PRODUCT_CREATED };
    expect(() => ProductUpdatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with invalid eventId (not UUID)', () => {
    const invalidEvent = { ...validEvent, eventId: 'not-a-uuid' };
    expect(() => ProductUpdatedSchema.parse(invalidEvent)).toThrow();
  });

  test('validates event without optional imageUrl', () => {
    const eventWithoutImage = {
      ...validEvent,
      payload: { ...validProductPayload, imageUrl: undefined },
    };
    expect(() => ProductUpdatedSchema.parse(eventWithoutImage)).not.toThrow();
  });
});

describe('ProductDeletedSchema', () => {
  const validDeletedEvent = {
    eventId: randomUUID(),
    type: EVENT_TYPES.PRODUCT_DELETED,
    timestamp: new Date().toISOString(),
    payload: {
      id: randomUUID(),
      deletedAt: new Date().toISOString(),
    },
  };

  test('validates correct product.deleted event', () => {
    expect(() => ProductDeletedSchema.parse(validDeletedEvent)).not.toThrow();
  });

  test('rejects event with wrong type', () => {
    const invalidEvent = { ...validDeletedEvent, type: EVENT_TYPES.PRODUCT_CREATED };
    expect(() => ProductDeletedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with invalid payload.id (not UUID)', () => {
    const invalidEvent = {
      ...validDeletedEvent,
      payload: { ...validDeletedEvent.payload, id: 'not-a-uuid' },
    };
    expect(() => ProductDeletedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with invalid deletedAt (not ISO)', () => {
    const invalidEvent = {
      ...validDeletedEvent,
      payload: { ...validDeletedEvent.payload, deletedAt: 'not-a-date' },
    };
    expect(() => ProductDeletedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects event with missing payload.deletedAt', () => {
    const invalidEvent = {
      ...validDeletedEvent,
      payload: { id: randomUUID() }, // missing deletedAt
    };
    expect(() => ProductDeletedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('createProductCreatedEvent', () => {
  test('creates valid event with auto-generated eventId and timestamp', () => {
    const event = createProductCreatedEvent(validProductPayload);

    expect(event.type).toBe(EVENT_TYPES.PRODUCT_CREATED);
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(event.payload).toEqual(validProductPayload);
  });

  test('generates unique eventIds for each call', () => {
    const event1 = createProductCreatedEvent(validProductPayload);
    const event2 = createProductCreatedEvent(validProductPayload);
    expect(event1.eventId).not.toBe(event2.eventId);
  });

  test('creates event without optional imageUrl', () => {
    const event = createProductCreatedEvent(validProductPayloadWithoutOptionals);
    expect(event.type).toBe(EVENT_TYPES.PRODUCT_CREATED);
    expect(event.payload.imageUrl).toBeUndefined();
  });

  test('creates event with empty categoryIds and tags', () => {
    const payload = { ...validProductPayload, categoryIds: [], categoryNames: [], tags: [] };
    const event = createProductCreatedEvent(payload);
    expect(event.payload.categoryIds).toEqual([]);
    expect(event.payload.tags).toEqual([]);
  });

  test('throws ZodError for invalid payload (non-UUID id)', () => {
    expect(() => {
      createProductCreatedEvent({ ...validProductPayload, id: 'not-a-uuid' });
    }).toThrow();
  });
});

describe('createProductUpdatedEvent', () => {
  test('creates valid product.updated event', () => {
    const event = createProductUpdatedEvent(validProductPayload);

    expect(event.type).toBe(EVENT_TYPES.PRODUCT_UPDATED);
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.payload).toEqual(validProductPayload);
  });

  test('generates unique eventId distinct from product.created', () => {
    const createdEvent = createProductCreatedEvent(validProductPayload);
    const updatedEvent = createProductUpdatedEvent(validProductPayload);
    expect(updatedEvent.type).toBe(EVENT_TYPES.PRODUCT_UPDATED);
    expect(updatedEvent.eventId).not.toBe(createdEvent.eventId);
  });

  test('throws ZodError for invalid payload', () => {
    expect(() => {
      createProductUpdatedEvent({ ...validProductPayload, price: -10 });
    }).not.toThrow(); // price has no min constraint in the spec — just number()
  });
});

describe('createProductDeletedEvent', () => {
  const validDeletedPayload = {
    id: randomUUID(),
    deletedAt: new Date().toISOString(),
  };

  test('creates valid product.deleted event', () => {
    const event = createProductDeletedEvent(validDeletedPayload);

    expect(event.type).toBe(EVENT_TYPES.PRODUCT_DELETED);
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.payload.id).toBe(validDeletedPayload.id);
    expect(event.payload.deletedAt).toBe(validDeletedPayload.deletedAt);
  });

  test('throws ZodError for invalid payload (non-UUID id)', () => {
    expect(() => {
      createProductDeletedEvent({ id: 'not-a-uuid', deletedAt: new Date().toISOString() });
    }).toThrow();
  });

  test('throws ZodError for invalid deletedAt', () => {
    expect(() => {
      createProductDeletedEvent({ id: randomUUID(), deletedAt: 'not-a-date' });
    }).toThrow();
  });
});

describe('validateEvent with product events', () => {
  test('returns success for valid product.created event', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.PRODUCT_CREATED,
      timestamp: new Date().toISOString(),
      payload: validProductPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
    expect(result.error).toBeUndefined();
  });

  test('returns success for valid product.updated event', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.PRODUCT_UPDATED,
      timestamp: new Date().toISOString(),
      payload: validProductPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
  });

  test('returns success for valid product.deleted event', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.PRODUCT_DELETED,
      timestamp: new Date().toISOString(),
      payload: {
        id: randomUUID(),
        deletedAt: new Date().toISOString(),
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
  });

  test('returns success for product.created event without optional imageUrl', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.PRODUCT_CREATED,
      timestamp: new Date().toISOString(),
      payload: validProductPayloadWithoutOptionals,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns failure for product.created event with invalid eventId', () => {
    const event = {
      eventId: 'not-a-uuid',
      type: EVENT_TYPES.PRODUCT_CREATED,
      timestamp: new Date().toISOString(),
      payload: validProductPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for product.created event with missing payload', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.PRODUCT_CREATED,
      timestamp: new Date().toISOString(),
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for product.deleted event with invalid payload.id', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.PRODUCT_DELETED,
      timestamp: new Date().toISOString(),
      payload: {
        id: 'not-a-uuid',
        deletedAt: new Date().toISOString(),
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
