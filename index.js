import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';
import { registerBackgroundHandler } from './src/services/notificationService';

// FCM messages received with the app in background / closed. The system already shows
// the notification; the handler only has to exist so the app can wake up.
registerBackgroundHandler(async () => {});

registerRootComponent(App);
