// src/services/notificationService.js
// AI-assisted: see docs/AI_LOG.md #13
// Firebase Cloud Messaging (FCM): permission, device token and message listeners.
// Only this file talks to @react-native-firebase/messaging.

import { PermissionsAndroid, Platform } from 'react-native';
import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

const messaging = () => getMessaging();

// Android 13+ asks for POST_NOTIFICATIONS at runtime; older versions grant it by default
export async function askNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  await requestPermission(messaging());
  return true;
}

export const getDeviceToken = () => getToken(messaging());

// Each listener returns its unsubscribe function (used as useEffect cleanup)
export const listenTokenRefresh = (callback) => onTokenRefresh(messaging(), callback);
export const listenForegroundMessages = (callback) => onMessage(messaging(), callback);
export const listenNotificationOpened = (callback) => onNotificationOpenedApp(messaging(), callback);

// Notification that launched the app from a closed state (or null)
export const getLaunchNotification = () => getInitialNotification(messaging());

// Must be registered at the top level of index.js, outside React
export function registerBackgroundHandler(handler) {
  setBackgroundMessageHandler(messaging(), handler);
}
