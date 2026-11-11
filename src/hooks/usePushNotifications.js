// src/hooks/usePushNotifications.js
// AI-assisted: see docs/AI_LOG.md #13
// Registers the device for FCM while there is a session: saves the token in the driver
// document and reacts to messages. Concept: useEffect with cleanup (listeners).

import { useEffect } from 'react';
import { Alert } from 'react-native';

import { saveFcmToken } from '../services/driverService';
import {
  askNotificationPermission,
  getDeviceToken,
  listenForegroundMessages,
  listenNotificationOpened,
  listenTokenRefresh,
} from '../services/notificationService';

export default function usePushNotifications(driverId) {
  // 1) Permission + token, saved in Firestore so the backend can send pushes
  useEffect(() => {
    if (!driverId) return undefined;
    let active = true;
    (async () => {
      try {
        const granted = await askNotificationPermission();
        if (!granted || !active) return;
        const token = await getDeviceToken();
        if (active && token) await saveFcmToken(driverId, token);
      } catch (e) {
        console.warn('FCM setup failed:', e);
      }
    })();
    const stopRefresh = listenTokenRefresh((token) => {
      saveFcmToken(driverId, token).catch((e) => console.warn('FCM token refresh failed:', e));
    });
    return () => {
      active = false;
      stopRefresh();
    };
  }, [driverId]);

  // 2) Messages. With the app open the request screen already appears through the
  //    Firestore listener, so here we only show a short notice. A tap on a
  //    notification just brings the app forward (the same listener opens the request).
  useEffect(() => {
    if (!driverId) return undefined;
    const stopForeground = listenForegroundMessages((message) => {
      const { title, body } = message.notification || {};
      if (title || body) Alert.alert(title || 'Notificación', body || '');
    });
    const stopOpened = listenNotificationOpened(() => {});
    return () => {
      stopForeground();
      stopOpened();
    };
  }, [driverId]);
}
