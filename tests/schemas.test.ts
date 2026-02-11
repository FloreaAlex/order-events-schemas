import { randomUUID } from 'crypto';
import {
  EVENT_TYPES,
  TOPICS,
  CONSUMER_GROUPS,
  OrderCreatedSchema,
  OrderConfirmedSchema,
  OrderShippedSchema,
  OrderCancelledSchema,
  PaymentAuthorizedSchema,
  PaymentFailedSchema,
  createOrderEvent,
  createPaymentEvent,
  validateEvent,
} from '../src';

describe('Constants', () => {
  test('TOPICS exports correct values', () => {
    expect(TOPICS.ORDER_EVENTS).toBe('order.events');
    expect(TOPICS.PAYMENT_EVENTS).toBe('payment.events');
  });

  test('CONSUMER_GROUPS exports correct values', () => {
    expect(CONSUMER_GROUPS.NOTIFICATION_WORKER).toBe('notification-worker-group');
    expect(CONSUMER_GROUPS.PRODUCT_SERVICE).toBe('product-service-group');
    expect(CONSUMER_GROUPS.PAYMENT_SERVICE).toBe('payment-service-group');
    expect(CONSUMER_GROUPS.ORDER_SERVICE).toBe('order-service-group');
  });

  test('EVENT_TYPES exports correct values', () => {
    expect(EVENT_TYPES.ORDER_CREATED).toBe('order.created');
    expect(EVENT_TYPES.ORDER_CONFIRMED).toBe('order.confirmed');
    expect(EVENT_TYPES.ORDER_SHIPPED).toBe('order.shipped');
    expect(EVENT_TYPES.ORDER_CANCELLED).toBe('order.cancelled');
    expect(EVENT_TYPES.PAYMENT_AUTHORIZED).toBe('payment.authorized');
    expect(EVENT_TYPES.PAYMENT_FAILED).toBe('payment.failed');
  });
});

describe('OrderCreatedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_CREATED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      items: [
        { productId: 1, quantity: 2, price: 19.99 },
        { productId: 2, quantity: 1, price: 9.99 },
      ],
      totalAmount: 49.97,
      shippingAddress: '123 Main St',
    },
  };

  test('validates correct order.created event', () => {
    expect(() => OrderCreatedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates order.created event without optional shippingAddress', () => {
    const eventWithoutAddress = { ...validEvent, data: { ...validEvent.data, shippingAddress: undefined } };
    expect(() => OrderCreatedSchema.parse(eventWithoutAddress)).not.toThrow();
  });

  test('rejects order.created event with empty items array', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, items: [] } };
    expect(() => OrderCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.created event with negative totalAmount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, totalAmount: -10 } };
    expect(() => OrderCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.created event with invalid item (negative price)', () => {
    const invalidEvent = {
      ...validEvent,
      data: {
        ...validEvent.data,
        items: [{ productId: 1, quantity: 1, price: -5 }],
      },
    };
    expect(() => OrderCreatedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.created event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_CONFIRMED };
    expect(() => OrderCreatedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderConfirmedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_CONFIRMED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      items: [{ productId: 1, quantity: 2, price: 19.99 }],
      totalAmount: 39.98,
      paymentId: 'pay_123456',
    },
  };

  test('validates correct order.confirmed event', () => {
    expect(() => OrderConfirmedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates order.confirmed event without optional paymentId', () => {
    const eventWithoutPayment = { ...validEvent, data: { ...validEvent.data, paymentId: undefined } };
    expect(() => OrderConfirmedSchema.parse(eventWithoutPayment)).not.toThrow();
  });

  test('rejects order.confirmed event with empty items', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, items: [] } };
    expect(() => OrderConfirmedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.confirmed event with invalid orderId (zero)', () => {
    const invalidEvent = { ...validEvent, orderId: 0 };
    expect(() => OrderConfirmedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderShippedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_SHIPPED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      trackingNumber: 'TRK123456',
      carrier: 'FedEx',
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
  };

  test('validates correct order.shipped event', () => {
    expect(() => OrderShippedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates order.shipped event with all optional fields omitted', () => {
    const minimalEvent = {
      ...validEvent,
      data: {},
    };
    expect(() => OrderShippedSchema.parse(minimalEvent)).not.toThrow();
  });

  test('rejects order.shipped event with invalid estimatedDelivery (not ISO datetime)', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, estimatedDelivery: 'not-a-date' } };
    expect(() => OrderShippedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.shipped event with invalid correlationId (not UUID)', () => {
    const invalidEvent = { ...validEvent, correlationId: 'not-a-uuid' };
    expect(() => OrderShippedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderCancelledSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_CANCELLED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      reason: 'Customer requested cancellation',
      cancelledBy: 'user' as const,
      refundAmount: 49.97,
    },
  };

  test('validates correct order.cancelled event', () => {
    expect(() => OrderCancelledSchema.parse(validEvent)).not.toThrow();
  });

  test('validates order.cancelled event with cancelledBy=system', () => {
    const systemEvent = { ...validEvent, data: { ...validEvent.data, cancelledBy: 'system' as const } };
    expect(() => OrderCancelledSchema.parse(systemEvent)).not.toThrow();
  });

  test('validates order.cancelled event with cancelledBy=admin', () => {
    const adminEvent = { ...validEvent, data: { ...validEvent.data, cancelledBy: 'admin' as const } };
    expect(() => OrderCancelledSchema.parse(adminEvent)).not.toThrow();
  });

  test('validates order.cancelled event without optional refundAmount', () => {
    const eventWithoutRefund = { ...validEvent, data: { ...validEvent.data, refundAmount: undefined } };
    expect(() => OrderCancelledSchema.parse(eventWithoutRefund)).not.toThrow();
  });

  test('rejects order.cancelled event with missing reason', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, reason: undefined } };
    expect(() => OrderCancelledSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.cancelled event with empty reason', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, reason: '' } };
    expect(() => OrderCancelledSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.cancelled event with invalid cancelledBy value', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, cancelledBy: 'invalid' } };
    expect(() => OrderCancelledSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.cancelled event with negative refundAmount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, refundAmount: -10 } };
    expect(() => OrderCancelledSchema.parse(invalidEvent)).toThrow();
  });
});

describe('createOrderEvent', () => {
  test('creates valid order.created event with auto-generated correlationId and timestamp', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
      orderId: 1,
      userId: 100,
      data: {
        items: [{ productId: 1, quantity: 2, price: 19.99 }],
        totalAmount: 39.98,
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_CREATED);
    expect(event.orderId).toBe(1);
    expect(event.userId).toBe(100);
    expect(event.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    if (event.type === EVENT_TYPES.ORDER_CREATED) {
      expect(event.data.items).toHaveLength(1);
    }
  });

  test('creates valid order.confirmed event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_CONFIRMED, {
      orderId: 1,
      userId: 100,
      data: {
        items: [{ productId: 1, quantity: 2, price: 19.99 }],
        totalAmount: 39.98,
        paymentId: 'pay_123',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_CONFIRMED);
    if (event.type === EVENT_TYPES.ORDER_CONFIRMED) {
      expect(event.data.paymentId).toBe('pay_123');
    }
  });

  test('creates valid order.shipped event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_SHIPPED, {
      orderId: 1,
      userId: 100,
      data: {
        trackingNumber: 'TRK123',
        carrier: 'FedEx',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_SHIPPED);
    if (event.type === EVENT_TYPES.ORDER_SHIPPED) {
      expect(event.data.trackingNumber).toBe('TRK123');
    }
  });

  test('creates valid order.cancelled event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_CANCELLED, {
      orderId: 1,
      userId: 100,
      data: {
        reason: 'Out of stock',
        cancelledBy: 'system',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_CANCELLED);
    if (event.type === EVENT_TYPES.ORDER_CANCELLED) {
      expect(event.data.reason).toBe('Out of stock');
      expect(event.data.cancelledBy).toBe('system');
    }
  });

  test('respects provided correlationId', () => {
    const customCorrelationId = randomUUID();
    const event = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
      orderId: 1,
      userId: 100,
      correlationId: customCorrelationId,
      data: {
        items: [{ productId: 1, quantity: 1, price: 10 }],
        totalAmount: 10,
      },
    });

    expect(event.correlationId).toBe(customCorrelationId);
  });

  test('respects provided timestamp', () => {
    const customTimestamp = '2026-01-01T00:00:00.000Z';
    const event = createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
      orderId: 1,
      userId: 100,
      timestamp: customTimestamp,
      data: {
        items: [{ productId: 1, quantity: 1, price: 10 }],
        totalAmount: 10,
      },
    });

    expect(event.timestamp).toBe(customTimestamp);
  });

  test('throws ZodError for invalid data', () => {
    expect(() => {
      createOrderEvent(EVENT_TYPES.ORDER_CREATED, {
        orderId: 1,
        userId: 100,
        data: {
          items: [], // Empty items array - invalid
          totalAmount: 10,
        },
      });
    }).toThrow();
  });

  test('throws error for unknown event type', () => {
    expect(() => {
      createOrderEvent('unknown.event' as any, {
        orderId: 1,
        userId: 100,
        data: {},
      });
    }).toThrow('Unknown event type');
  });
});

describe('validateEvent', () => {
  test('returns success for valid order.created event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_CREATED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        items: [{ productId: 1, quantity: 1, price: 10 }],
        totalAmount: 10,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
    expect(result.error).toBeUndefined();
  });

  test('returns failure for invalid event (empty items)', () => {
    const event = {
      type: EVENT_TYPES.ORDER_CREATED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        items: [],
        totalAmount: 10,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for null event', () => {
    const result = validateEvent(null);
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('non-null object');
  });

  test('returns failure for undefined event', () => {
    const result = validateEvent(undefined);
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('non-null object');
  });

  test('returns failure for event with missing type', () => {
    const result = validateEvent({ orderId: 1, userId: 100 });
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('type is required');
  });

  test('returns failure for event with unknown type', () => {
    const event = {
      type: 'unknown.event',
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {},
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('Unknown event type');
  });

  test('returns success for valid order.confirmed event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_CONFIRMED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        items: [{ productId: 1, quantity: 1, price: 10 }],
        totalAmount: 10,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns success for valid order.shipped event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_SHIPPED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        trackingNumber: 'TRK123',
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns success for valid order.cancelled event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_CANCELLED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        reason: 'User requested',
        cancelledBy: 'user',
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });
});

describe('PaymentAuthorizedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.PAYMENT_AUTHORIZED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      transactionId: 'txn_123456',
      amount: 49.99,
      currency: 'USD',
    },
  };

  test('validates correct payment.authorized event', () => {
    expect(() => PaymentAuthorizedSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects payment.authorized event with negative amount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, amount: -10 } };
    expect(() => PaymentAuthorizedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.authorized event with zero amount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, amount: 0 } };
    expect(() => PaymentAuthorizedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.authorized event with missing transactionId', () => {
    const invalidEvent = { ...validEvent, data: { amount: 49.99, currency: 'USD' } };
    expect(() => PaymentAuthorizedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.authorized event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_CREATED };
    expect(() => PaymentAuthorizedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.authorized event with invalid orderId (zero)', () => {
    const invalidEvent = { ...validEvent, orderId: 0 };
    expect(() => PaymentAuthorizedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('PaymentFailedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.PAYMENT_FAILED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      reason: 'Insufficient funds',
      retryable: true,
    },
  };

  test('validates correct payment.failed event', () => {
    expect(() => PaymentFailedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates payment.failed event with retryable=false', () => {
    const nonRetryableEvent = { ...validEvent, data: { ...validEvent.data, retryable: false } };
    expect(() => PaymentFailedSchema.parse(nonRetryableEvent)).not.toThrow();
  });

  test('rejects payment.failed event with missing reason', () => {
    const invalidEvent = { ...validEvent, data: { retryable: true } };
    expect(() => PaymentFailedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.failed event with missing retryable', () => {
    const invalidEvent = { ...validEvent, data: { reason: 'Insufficient funds' } };
    expect(() => PaymentFailedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.failed event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.PAYMENT_AUTHORIZED };
    expect(() => PaymentFailedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.failed event with invalid correlationId (not UUID)', () => {
    const invalidEvent = { ...validEvent, correlationId: 'not-a-uuid' };
    expect(() => PaymentFailedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('createPaymentEvent', () => {
  test('creates valid payment.authorized event with auto-generated correlationId and timestamp', () => {
    const event = createPaymentEvent(EVENT_TYPES.PAYMENT_AUTHORIZED, {
      orderId: 1,
      userId: 100,
      data: {
        transactionId: 'txn_abc123',
        amount: 99.99,
        currency: 'USD',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.PAYMENT_AUTHORIZED);
    expect(event.orderId).toBe(1);
    expect(event.userId).toBe(100);
    expect(event.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    if (event.type === EVENT_TYPES.PAYMENT_AUTHORIZED) {
      expect(event.data.transactionId).toBe('txn_abc123');
      expect(event.data.amount).toBe(99.99);
      expect(event.data.currency).toBe('USD');
    }
  });

  test('creates valid payment.failed event', () => {
    const event = createPaymentEvent(EVENT_TYPES.PAYMENT_FAILED, {
      orderId: 1,
      userId: 100,
      data: {
        reason: 'Card declined',
        retryable: false,
      },
    });

    expect(event.type).toBe(EVENT_TYPES.PAYMENT_FAILED);
    if (event.type === EVENT_TYPES.PAYMENT_FAILED) {
      expect(event.data.reason).toBe('Card declined');
      expect(event.data.retryable).toBe(false);
    }
  });

  test('respects provided correlationId', () => {
    const customCorrelationId = randomUUID();
    const event = createPaymentEvent(EVENT_TYPES.PAYMENT_AUTHORIZED, {
      orderId: 1,
      userId: 100,
      correlationId: customCorrelationId,
      data: {
        transactionId: 'txn_123',
        amount: 10,
        currency: 'EUR',
      },
    });

    expect(event.correlationId).toBe(customCorrelationId);
  });

  test('respects provided timestamp', () => {
    const customTimestamp = '2026-01-01T00:00:00.000Z';
    const event = createPaymentEvent(EVENT_TYPES.PAYMENT_FAILED, {
      orderId: 1,
      userId: 100,
      timestamp: customTimestamp,
      data: {
        reason: 'Timeout',
        retryable: true,
      },
    });

    expect(event.timestamp).toBe(customTimestamp);
  });

  test('throws ZodError for invalid data (negative amount)', () => {
    expect(() => {
      createPaymentEvent(EVENT_TYPES.PAYMENT_AUTHORIZED, {
        orderId: 1,
        userId: 100,
        data: {
          transactionId: 'txn_123',
          amount: -50,
          currency: 'USD',
        },
      });
    }).toThrow();
  });

  test('throws error for unknown event type', () => {
    expect(() => {
      createPaymentEvent('unknown.payment' as any, {
        orderId: 1,
        userId: 100,
        data: {
          transactionId: 'txn_test',
          amount: 10,
          currency: 'USD',
        },
      } as any);
    }).toThrow('Unknown event type');
  });
});

describe('validateEvent with payment events', () => {
  test('returns success for valid payment.authorized event', () => {
    const event = {
      type: EVENT_TYPES.PAYMENT_AUTHORIZED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        transactionId: 'txn_456',
        amount: 75.50,
        currency: 'GBP',
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
    expect(result.error).toBeUndefined();
  });

  test('returns success for valid payment.failed event', () => {
    const event = {
      type: EVENT_TYPES.PAYMENT_FAILED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        reason: 'Network error',
        retryable: true,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
    expect(result.error).toBeUndefined();
  });

  test('returns failure for invalid payment.authorized event (negative amount)', () => {
    const event = {
      type: EVENT_TYPES.PAYMENT_AUTHORIZED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        transactionId: 'txn_789',
        amount: -10,
        currency: 'USD',
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for invalid payment.failed event (missing reason)', () => {
    const event = {
      type: EVENT_TYPES.PAYMENT_FAILED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        retryable: true,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
  });
});
