// backend/src/server.js
// AI-assisted: see docs/AI_LOG.md #14
// Express server: health check, Mercado Pago endpoints and the FCM trip watcher.

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const cors = require('cors');
const express = require('express');

const { confirmPayment, createPreference, handleWebhook } = require('./payments');
const { startTripWatcher } = require('./tripWatcher');

const app = express();
app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(`[${req.method} ${req.path}]`, e.message);
    res.status(e.status || 500).json({ error: e.message });
  });

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/payments/preference', wrap(async (req, res) => {
  const { tripId, driverId } = req.body || {};
  if (!tripId || !driverId) return res.status(400).json({ error: 'tripId and driverId are required' });
  res.json(await createPreference(tripId, driverId));
}));

app.post('/payments/confirm', wrap(async (req, res) => {
  const { tripId, driverId } = req.body || {};
  if (!tripId || !driverId) return res.status(400).json({ error: 'tripId and driverId are required' });
  res.json(await confirmPayment(tripId, driverId));
}));

// Mercado Pago expects a fast 200; processing errors are only logged
app.post('/webhooks/mercadopago', (req, res) => {
  res.sendStatus(200);
  handleWebhook(req.body, req.query).catch((e) => console.error('[webhook]', e.message));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
  startTripWatcher();
});
