/**
 * Centralized Notification Module
 *
 * Provides push notification setup and sending capabilities.
 * Handles both local and remote notifications.
 *
 * NOTE: expo-notifications remote push was removed from Expo Go in SDK 53.
 * This module gracefully degrades when running in Expo Go.
 */

import { Platform } from 'react-native';

let Notifications: typeof import('expo-notifications') | null = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  notificationsAvailable = true;
} catch (e) {
  console.warn('expo-notifications is not available in this environment.');
}

// ─── Configuration ────────────────────────────────────────────────────────────

if (notificationsAvailable && Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('Failed to set notification handler:', e);
    notificationsAvailable = false;
  }
}

// ─── Permission Request ──────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!notificationsAvailable || !Notifications) {
    console.warn('Notifications not available — skipping permission request.');
    return false;
  }
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF7A00',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
}

// ─── Send Local Notification ─────────────────────────────────────────────────

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<string | null> {
  if (!notificationsAvailable || !Notifications) return null;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Immediate
    });
    return id;
  } catch (error) {
    console.error('Notification send error:', error);
    return null;
  }
}

// ─── Order Status Notifications ──────────────────────────────────────────────

export type OrderStatus =
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

const ORDER_MESSAGES: Record<OrderStatus, { title: string; body: string }> = {
  CONFIRMED: {
    title: '✅ Order Confirmed!',
    body: 'Your order has been accepted by the restaurant.',
  },
  PREPARING: {
    title: '👨‍🍳 Being Prepared',
    body: 'The chef is preparing your delicious food!',
  },
  READY: {
    title: '🎉 Order Ready!',
    body: 'Your order is ready for pickup.',
  },
  PICKED_UP: {
    title: '🚗 Order Picked Up',
    body: 'Your order has been picked up and is on the way.',
  },
  DELIVERED: {
    title: '🍽️ Delivered!',
    body: 'Enjoy your meal! Don\'t forget to rate your experience.',
  },
  CANCELLED: {
    title: '❌ Order Cancelled',
    body: 'Your order has been cancelled. A refund will be processed if applicable.',
  },
};

export async function notifyOrderStatus(
  status: OrderStatus,
  orderId: string,
  restaurantName?: string,
): Promise<void> {
  const msg = ORDER_MESSAGES[status];
  if (!msg) return;

  const body = restaurantName
    ? `${msg.body} (${restaurantName})`
    : msg.body;

  await sendLocalNotification(msg.title, body, {
    type: 'order_status',
    orderId,
    status,
  });
}

// ─── Schedule Future Notification ────────────────────────────────────────────

export async function scheduleNotification(
  title: string,
  body: string,
  seconds: number,
  data?: Record<string, any>,
): Promise<string | null> {
  if (!notificationsAvailable || !Notifications) return null;
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });
    return id;
  } catch (error) {
    console.error('Schedule notification error:', error);
    return null;
  }
}

// ─── Cancel All ──────────────────────────────────────────────────────────────

export async function cancelAllNotifications(): Promise<void> {
  if (!notificationsAvailable || !Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Get Push Token ──────────────────────────────────────────────────────────

export async function getPushToken(): Promise<string | null> {
  if (!notificationsAvailable || !Notifications) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error('Push token error:', error);
    return null;
  }
}
