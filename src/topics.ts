/**
 * Kafka topic constants
 */
export const TOPICS = {
  ORDER_EVENTS: 'order.events',
} as const;

/**
 * Kafka consumer group constants
 */
export const CONSUMER_GROUPS = {
  NOTIFICATION_WORKER: 'notification-worker-group',
  PRODUCT_SERVICE: 'product-service-group',
} as const;

export type Topic = typeof TOPICS[keyof typeof TOPICS];
export type ConsumerGroup = typeof CONSUMER_GROUPS[keyof typeof CONSUMER_GROUPS];
