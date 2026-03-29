import { randomUUID } from 'crypto';
import {
  EVENT_TYPES,
  TOPICS,
  CONSUMER_GROUPS,
  ReviewCreatedSchema,
  createReviewCreatedEvent,
  validateEvent,
} from '../src';

const validReviewPayload = {
  reviewId: 42,
  productId: 7,
  userId: 100,
  rating: 4,
  timestamp: new Date().toISOString(),
};

describe('New constants (loyalty service)', () => {
  test('CONSUMER_GROUPS includes LOYALTY_SERVICE', () => {
    expect(CONSUMER_GROUPS.LOYALTY_SERVICE).toBe('loyalty-service-group');
  });

  test('EVENT_TYPES includes REVIEW_CREATED', () => {
    expect(EVENT_TYPES.REVIEW_CREATED).toBe('review.created');
  });

  test('review.created uses TOPICS.PRODUCT_EVENTS topic', () => {
    // Verifies the constant value — consumers route this event to product.events
    expect(TOPICS.PRODUCT_EVENTS).toBe('product.events');
  });
});

describe('ReviewCreatedSchema', () => {
  const validEvent = {
    eventId: randomUUID(),
    type: EVENT_TYPES.REVIEW_CREATED,
    timestamp: new Date().toISOString(),
    payload: validReviewPayload,
  };

  test('validates correct review.created event', () => {
    expect(() => ReviewCreatedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates review.created with minimum valid rating (1)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, rating: 1 } };
    expect(() => ReviewCreatedSchema.parse(event)).not.toThrow();
  });

  test('validates review.created with maximum valid rating (5)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, rating: 5 } };
    expect(() => ReviewCreatedSchema.parse(event)).not.toThrow();
  });

  test('rejects review.created with rating below 1 (0)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, rating: 0 } };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with rating above 5 (6)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, rating: 6 } };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with non-integer rating (3.5)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, rating: 3.5 } };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with missing reviewId', () => {
    const { reviewId, ...payloadWithoutReviewId } = validEvent.payload;
    const event = { ...validEvent, payload: payloadWithoutReviewId };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with missing productId', () => {
    const { productId, ...payloadWithoutProductId } = validEvent.payload;
    const event = { ...validEvent, payload: payloadWithoutProductId };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with missing timestamp in payload', () => {
    const { timestamp, ...payloadWithoutTimestamp } = validEvent.payload;
    const event = { ...validEvent, payload: payloadWithoutTimestamp };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with invalid payload timestamp (not ISO datetime)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, timestamp: 'not-a-date' } };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with missing eventId', () => {
    const { eventId, ...eventWithoutId } = validEvent;
    expect(() => ReviewCreatedSchema.parse(eventWithoutId)).toThrow();
  });

  test('rejects review.created with invalid eventId (not UUID)', () => {
    const event = { ...validEvent, eventId: 'not-a-uuid' };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with wrong event type', () => {
    const event = { ...validEvent, type: EVENT_TYPES.PRODUCT_CREATED };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with non-positive reviewId (0)', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, reviewId: 0 } };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });

  test('rejects review.created with non-integer userId', () => {
    const event = { ...validEvent, payload: { ...validEvent.payload, userId: 1.5 } };
    expect(() => ReviewCreatedSchema.parse(event)).toThrow();
  });
});

describe('createReviewCreatedEvent', () => {
  test('creates valid review.created event with auto-generated eventId and timestamp', () => {
    const event = createReviewCreatedEvent(validReviewPayload);

    expect(event.type).toBe(EVENT_TYPES.REVIEW_CREATED);
    expect(event.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(event.payload.reviewId).toBe(validReviewPayload.reviewId);
    expect(event.payload.rating).toBe(validReviewPayload.rating);
  });

  test('throws ZodError for invalid rating (0)', () => {
    expect(() => createReviewCreatedEvent({ ...validReviewPayload, rating: 0 })).toThrow();
  });

  test('throws ZodError for missing reviewId', () => {
    const { reviewId, ...payloadWithoutReviewId } = validReviewPayload;
    expect(() => createReviewCreatedEvent(payloadWithoutReviewId as any)).toThrow();
  });
});

describe('validateEvent with review.created', () => {
  test('returns success for valid review.created event', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.REVIEW_CREATED,
      timestamp: new Date().toISOString(),
      payload: validReviewPayload,
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    if (result.success && result.data?.type === EVENT_TYPES.REVIEW_CREATED) {
      expect(result.data.payload.rating).toBe(validReviewPayload.rating);
    }
  });

  test('returns failure for review.created with invalid rating (6)', () => {
    const event = {
      eventId: randomUUID(),
      type: EVENT_TYPES.REVIEW_CREATED,
      timestamp: new Date().toISOString(),
      payload: { ...validReviewPayload, rating: 6 },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
