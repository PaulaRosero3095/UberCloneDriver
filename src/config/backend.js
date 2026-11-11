// src/config/backend.js
// AI-assisted: see docs/AI_LOG.md #14
// Where the Express backend lives. The Android emulator reaches the PC through 10.0.2.2.
// On a real phone use the PC's LAN IP (http://192.168.x.x:3000) or a public URL.

export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:3000';

// Must match PAYMENT_RETURN_URL of the backend: the WebView intercepts it
export const PAYMENT_RETURN_URL = process.env.EXPO_PUBLIC_PAYMENT_RETURN_URL || 'https://uberclone-conductor.example/pago';
