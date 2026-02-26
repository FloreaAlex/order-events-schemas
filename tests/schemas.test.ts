import { randomUUID } from 'crypto';
import {
  EVENT_TYPES,
  TOPICS,
  CONSUMER_GROUPS,
  OrderCreatedSchema,
  OrderConfirmedSchema,
  OrderShippedSchema,
  OrderCancelledSchema,
  OrderDeliveredSchema,
  OrderReturnRequestedSchema,
  OrderReturnApprovedSchema,
  OrderReturnRejectedSchema,
  OrderReturnRefundedSchema,
  PaymentAuthorizedSchema,
  PaymentFailedSchema,
  PaymentRefundedSchema,
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
    expect(CONSUMER_GROUPS.ANALYTICS_SERVICE).toBe('analytics-service-group');
  });

  test('EVENT_TYPES exports correct values', () => {
    expect(EVENT_TYPES.ORDER_CREATED).toBe('order.created');
    expect(EVENT_TYPES.ORDER_CONFIRMED).toBe('order.confirmed');
    expect(EVENT_TYPES.ORDER_SHIPPED).toBe('order.shipped');
    expect(EVENT_TYPES.ORDER_CANCELLED).toBe('order.cancelled');
    expect(EVENT_TYPES.PAYMENT_AUTHORIZED).toBe('payment.authorized');
    expect(EVENT_TYPES.PAYMENT_FAILED).toBe('payment.failed');
    expect(EVENT_TYPES.ORDER_DELIVERED).toBe('order.delivered');
    expect(EVENT_TYPES.ORDER_RETURN_REQUESTED).toBe('order.return_requested');
    expect(EVENT_TYPES.ORDER_RETURN_APPROVED).toBe('order.return_approved');
    expect(EVENT_TYPES.ORDER_RETURN_REJECTED).toBe('order.return_rejected');
    expect(EVENT_TYPES.ORDER_RETURN_REFUNDED).toBe('order.return_refunded');
    expect(EVENT_TYPES.PAYMENT_REFUNDED).toBe('payment.refunded');
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

  test('validates order.cancelled event with new optional fields (items, totalAmount, previousStatus)', () => {
    const eventWithNewFields = {
      ...validEvent,
      data: {
        ...validEvent.data,
        items: [{ productId: 1, quantity: 2, price: 19.99 }],
        totalAmount: 39.98,
        previousStatus: 'confirmed' as const,
      },
    };
    expect(() => OrderCancelledSchema.parse(eventWithNewFields)).not.toThrow();
  });

  test('validates order.cancelled event with previousStatus=created', () => {
    const eventWithCreatedStatus = {
      ...validEvent,
      data: {
        ...validEvent.data,
        previousStatus: 'created' as const,
      },
    };
    expect(() => OrderCancelledSchema.parse(eventWithCreatedStatus)).not.toThrow();
  });

  test('validates order.cancelled event without new optional fields (backward compat)', () => {
    // The original validEvent without items, totalAmount, or previousStatus must still pass
    expect(() => OrderCancelledSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects order.cancelled event with invalid previousStatus value', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, previousStatus: 'shipped' } };
    expect(() => OrderCancelledSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.cancelled event with invalid item in items array (negative price)', () => {
    const invalidEvent = {
      ...validEvent,
      data: {
        ...validEvent.data,
        items: [{ productId: 1, quantity: 1, price: -5 }],
      },
    };
    expect(() => OrderCancelledSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.cancelled event with zero totalAmount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, totalAmount: 0 } };
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

  test('creates valid order.cancelled event with new fields (items, totalAmount, previousStatus)', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_CANCELLED, {
      orderId: 1,
      userId: 100,
      data: {
        reason: 'Customer requested cancellation',
        cancelledBy: 'user',
        items: [{ productId: 3, quantity: 1, price: 29.99 }],
        totalAmount: 29.99,
        previousStatus: 'confirmed',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_CANCELLED);
    if (event.type === EVENT_TYPES.ORDER_CANCELLED) {
      expect(event.data.reason).toBe('Customer requested cancellation');
      expect(event.data.cancelledBy).toBe('user');
      expect(event.data.items).toHaveLength(1);
      expect(event.data.totalAmount).toBe(29.99);
      expect(event.data.previousStatus).toBe('confirmed');
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

  test('returns success for valid order.cancelled event with new optional fields', () => {
    const event = {
      type: EVENT_TYPES.ORDER_CANCELLED,
      orderId: 5,
      userId: 200,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        reason: 'Customer requested cancellation',
        cancelledBy: 'user',
        items: [{ productId: 2, quantity: 3, price: 9.99 }],
        totalAmount: 29.97,
        previousStatus: 'confirmed',
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

  test('rejects payment.authorized event with empty transactionId', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, transactionId: '' } };
    expect(() => PaymentAuthorizedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.authorized event with empty currency', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, currency: '' } };
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

  test('rejects payment.failed event with empty reason', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, reason: '' } };
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

describe('OrderDeliveredSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_DELIVERED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      items: [{ productId: 1, quantity: 2, price: 19.99 }],
      totalAmount: 39.98,
    },
  };

  test('validates correct order.delivered event', () => {
    expect(() => OrderDeliveredSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects order.delivered event with empty items array', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, items: [] } };
    expect(() => OrderDeliveredSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.delivered event with negative totalAmount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, totalAmount: -10 } };
    expect(() => OrderDeliveredSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.delivered event with missing data fields', () => {
    const invalidEvent = { ...validEvent, data: {} };
    expect(() => OrderDeliveredSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.delivered event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_SHIPPED };
    expect(() => OrderDeliveredSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderReturnRequestedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_RETURN_REQUESTED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      category: 'defective',
      reason: 'Product arrived broken',
      items: [{ productId: 1, quantity: 1, price: 29.99 }],
      totalAmount: 29.99,
    },
  };

  test('validates correct order.return_requested event', () => {
    expect(() => OrderReturnRequestedSchema.parse(validEvent)).not.toThrow();
  });

  test('validates order.return_requested event without optional reason', () => {
    const eventWithoutReason = { ...validEvent, data: { ...validEvent.data, reason: undefined } };
    expect(() => OrderReturnRequestedSchema.parse(eventWithoutReason)).not.toThrow();
  });

  test('rejects order.return_requested event with empty reason string', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, reason: '' } };
    expect(() => OrderReturnRequestedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_requested event with empty category', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, category: '' } };
    expect(() => OrderReturnRequestedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_requested event with empty items array', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, items: [] } };
    expect(() => OrderReturnRequestedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_requested event with missing category', () => {
    const { category, ...dataWithoutCategory } = validEvent.data;
    const invalidEvent = { ...validEvent, data: dataWithoutCategory };
    expect(() => OrderReturnRequestedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_requested event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_CANCELLED };
    expect(() => OrderReturnRequestedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderReturnApprovedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_RETURN_APPROVED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      items: [{ productId: 1, quantity: 1, price: 29.99 }],
      totalAmount: 29.99,
    },
  };

  test('validates correct order.return_approved event', () => {
    expect(() => OrderReturnApprovedSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects order.return_approved event with empty items array', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, items: [] } };
    expect(() => OrderReturnApprovedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_approved event with zero totalAmount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, totalAmount: 0 } };
    expect(() => OrderReturnApprovedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_approved event with invalid item (negative quantity)', () => {
    const invalidEvent = {
      ...validEvent,
      data: {
        ...validEvent.data,
        items: [{ productId: 1, quantity: -1, price: 29.99 }],
      },
    };
    expect(() => OrderReturnApprovedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_approved event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_RETURN_REQUESTED };
    expect(() => OrderReturnApprovedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderReturnRejectedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_RETURN_REJECTED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      adminReason: 'Return window has expired',
    },
  };

  test('validates correct order.return_rejected event', () => {
    expect(() => OrderReturnRejectedSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects order.return_rejected event with empty adminReason', () => {
    const invalidEvent = { ...validEvent, data: { adminReason: '' } };
    expect(() => OrderReturnRejectedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_rejected event with missing adminReason', () => {
    const invalidEvent = { ...validEvent, data: {} };
    expect(() => OrderReturnRejectedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_rejected event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_RETURN_APPROVED };
    expect(() => OrderReturnRejectedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_rejected event with invalid correlationId', () => {
    const invalidEvent = { ...validEvent, correlationId: 'not-a-uuid' };
    expect(() => OrderReturnRejectedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('OrderReturnRefundedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.ORDER_RETURN_REFUNDED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      refundAmount: 29.99,
    },
  };

  test('validates correct order.return_refunded event', () => {
    expect(() => OrderReturnRefundedSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects order.return_refunded event with zero refundAmount', () => {
    const invalidEvent = { ...validEvent, data: { refundAmount: 0 } };
    expect(() => OrderReturnRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_refunded event with negative refundAmount', () => {
    const invalidEvent = { ...validEvent, data: { refundAmount: -10 } };
    expect(() => OrderReturnRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_refunded event with missing refundAmount', () => {
    const invalidEvent = { ...validEvent, data: {} };
    expect(() => OrderReturnRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects order.return_refunded event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.ORDER_CANCELLED };
    expect(() => OrderReturnRefundedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('PaymentRefundedSchema', () => {
  const validEvent = {
    type: EVENT_TYPES.PAYMENT_REFUNDED,
    orderId: 1,
    userId: 100,
    correlationId: randomUUID(),
    timestamp: new Date().toISOString(),
    data: {
      amount: 49.99,
      currency: 'USD',
    },
  };

  test('validates correct payment.refunded event', () => {
    expect(() => PaymentRefundedSchema.parse(validEvent)).not.toThrow();
  });

  test('rejects payment.refunded event with negative amount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, amount: -10 } };
    expect(() => PaymentRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.refunded event with zero amount', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, amount: 0 } };
    expect(() => PaymentRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.refunded event with empty currency', () => {
    const invalidEvent = { ...validEvent, data: { ...validEvent.data, currency: '' } };
    expect(() => PaymentRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.refunded event with missing amount', () => {
    const invalidEvent = { ...validEvent, data: { currency: 'USD' } };
    expect(() => PaymentRefundedSchema.parse(invalidEvent)).toThrow();
  });

  test('rejects payment.refunded event with wrong event type', () => {
    const invalidEvent = { ...validEvent, type: EVENT_TYPES.PAYMENT_AUTHORIZED };
    expect(() => PaymentRefundedSchema.parse(invalidEvent)).toThrow();
  });
});

describe('createOrderEvent with new event types', () => {
  test('creates valid order.delivered event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_DELIVERED, {
      orderId: 1,
      userId: 100,
      data: {
        items: [{ productId: 1, quantity: 2, price: 19.99 }],
        totalAmount: 39.98,
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_DELIVERED);
    expect(event.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    if (event.type === EVENT_TYPES.ORDER_DELIVERED) {
      expect(event.data.items).toHaveLength(1);
      expect(event.data.totalAmount).toBe(39.98);
    }
  });

  test('creates valid order.return_requested event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_RETURN_REQUESTED, {
      orderId: 2,
      userId: 200,
      data: {
        category: 'defective',
        reason: 'Broken on arrival',
        items: [{ productId: 5, quantity: 1, price: 49.99 }],
        totalAmount: 49.99,
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_RETURN_REQUESTED);
    if (event.type === EVENT_TYPES.ORDER_RETURN_REQUESTED) {
      expect(event.data.category).toBe('defective');
      expect(event.data.reason).toBe('Broken on arrival');
    }
  });

  test('creates valid order.return_approved event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_RETURN_APPROVED, {
      orderId: 3,
      userId: 300,
      data: {
        items: [{ productId: 10, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_RETURN_APPROVED);
    if (event.type === EVENT_TYPES.ORDER_RETURN_APPROVED) {
      expect(event.data.items).toHaveLength(1);
    }
  });

  test('creates valid order.return_rejected event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_RETURN_REJECTED, {
      orderId: 4,
      userId: 400,
      data: {
        adminReason: 'Return window expired',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_RETURN_REJECTED);
    if (event.type === EVENT_TYPES.ORDER_RETURN_REJECTED) {
      expect(event.data.adminReason).toBe('Return window expired');
    }
  });

  test('creates valid order.return_refunded event', () => {
    const event = createOrderEvent(EVENT_TYPES.ORDER_RETURN_REFUNDED, {
      orderId: 5,
      userId: 500,
      data: {
        refundAmount: 29.99,
      },
    });

    expect(event.type).toBe(EVENT_TYPES.ORDER_RETURN_REFUNDED);
    if (event.type === EVENT_TYPES.ORDER_RETURN_REFUNDED) {
      expect(event.data.refundAmount).toBe(29.99);
    }
  });
});

describe('createPaymentEvent with payment.refunded', () => {
  test('creates valid payment.refunded event', () => {
    const event = createPaymentEvent(EVENT_TYPES.PAYMENT_REFUNDED, {
      orderId: 1,
      userId: 100,
      data: {
        amount: 49.99,
        currency: 'USD',
      },
    });

    expect(event.type).toBe(EVENT_TYPES.PAYMENT_REFUNDED);
    expect(event.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    if (event.type === EVENT_TYPES.PAYMENT_REFUNDED) {
      expect(event.data.amount).toBe(49.99);
      expect(event.data.currency).toBe('USD');
    }
  });

  test('throws ZodError for invalid payment.refunded data (negative amount)', () => {
    expect(() => {
      createPaymentEvent(EVENT_TYPES.PAYMENT_REFUNDED, {
        orderId: 1,
        userId: 100,
        data: {
          amount: -10,
          currency: 'USD',
        },
      });
    }).toThrow();
  });
});

describe('validateEvent with new event types', () => {
  test('returns success for valid order.delivered event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_DELIVERED,
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
  });

  test('returns success for valid order.return_requested event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_RETURN_REQUESTED,
      orderId: 2,
      userId: 200,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        category: 'wrong_item',
        items: [{ productId: 3, quantity: 1, price: 25 }],
        totalAmount: 25,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns success for valid order.return_approved event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_RETURN_APPROVED,
      orderId: 3,
      userId: 300,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        items: [{ productId: 5, quantity: 2, price: 15 }],
        totalAmount: 30,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns success for valid order.return_rejected event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_RETURN_REJECTED,
      orderId: 4,
      userId: 400,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        adminReason: 'Item not eligible for return',
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns success for valid order.return_refunded event', () => {
    const event = {
      type: EVENT_TYPES.ORDER_RETURN_REFUNDED,
      orderId: 5,
      userId: 500,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        refundAmount: 50,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
  });

  test('returns success for valid payment.refunded event', () => {
    const event = {
      type: EVENT_TYPES.PAYMENT_REFUNDED,
      orderId: 6,
      userId: 600,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        amount: 75.50,
        currency: 'EUR',
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(event);
  });

  test('returns failure for invalid order.delivered event (empty items)', () => {
    const event = {
      type: EVENT_TYPES.ORDER_DELIVERED,
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
    expect(result.error).toBeInstanceOf(Error);
  });

  test('returns failure for invalid payment.refunded event (missing currency)', () => {
    const event = {
      type: EVENT_TYPES.PAYMENT_REFUNDED,
      orderId: 1,
      userId: 100,
      correlationId: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        amount: 50,
      },
    };

    const result = validateEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
