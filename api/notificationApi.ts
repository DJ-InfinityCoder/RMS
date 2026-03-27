import { Platform, Alert } from 'react-native';

// Notification service for order status updates
// Uses simple Alert for demo; in production, use expo-notifications

export type NotificationType = 'order_placed' | 'order_prepared' | 'order_ready';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  orderId: string;
}

const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
  order_placed: {
    title: '🎉 Order Placed!',
    body: 'Your order has been placed successfully. We\'re preparing it now!',
  },
  order_prepared: {
    title: '👨‍🍳 Order Prepared!',
    body: 'Your food is being prepared. Almost ready!',
  },
  order_ready: {
    title: '✅ Order Ready!',
    body: 'Your order is ready for takeaway. Please come and collect it!',
  },
};

export const sendLocalNotification = (type: NotificationType, orderId: string): void => {
  const msg = NOTIFICATION_MESSAGES[type];
  if (!msg) return;

  // For demo, use Alert
  Alert.alert(
    msg.title,
    `${msg.body}\n\nOrder: ${orderId}`,
    [{ text: 'OK', style: 'default' }]
  );
};

export const sendOrderStatusNotification = (
  orderId: string,
  status: 'placed' | 'prepared' | 'ready'
): void => {
  const typeMap: Record<string, NotificationType> = {
    placed: 'order_placed',
    prepared: 'order_prepared',
    ready: 'order_ready',
  };
  sendLocalNotification(typeMap[status], orderId);
};
