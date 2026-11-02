// src/config/firebase.js
// AI-assisted: see docs/AI_LOG.md #2
// Firebase setup. Values come from the .env file, never written in the code.

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Firestore instance. Only the files in src/services will import it.
// Auto-detect long polling: avoids connection problems on React Native and emulators.
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
