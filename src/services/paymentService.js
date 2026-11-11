// src/services/paymentService.js
// AI-assisted: see docs/AI_LOG.md #14
// Talks to our Express backend (never to Mercado Pago directly: the access token stays there).

import { BACKEND_URL } from '../config/backend';

async function post(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Backend error ${response.status}`);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// -> { preferenceId, initPoint }
export const createPaymentPreference = (tripId, driverId) =>
  post('/payments/preference', { tripId, driverId });

// -> { status: 'approved' | 'pending' | 'rejected' }
export const confirmPayment = (tripId, driverId) =>
  post('/payments/confirm', { tripId, driverId });
