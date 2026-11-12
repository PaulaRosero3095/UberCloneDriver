// backend/src/payments.js
// AI-assisted: see docs/AI_LOG.md #14
// Mercado Pago Checkout Pro (test mode): create a preference, verify the payment with the
// Mercado Pago API and, only then, mark the trip as paid and credit the driver balance.
// The app is never trusted to say "I paid": the status always comes from Mercado Pago.

const { db, FieldValue } = require('./firebase');

const MP_API = 'https://api.mercadopago.com';
const token = () => {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN is not configured');
  return process.env.MP_ACCESS_TOKEN;
};

async function mp(path, options = {}) {
  const response = await fetch(`${MP_API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Mercado Pago ${response.status}: ${body.message || JSON.stringify(body)}`);
  return body;
}

const RETURN_URL = () => process.env.PAYMENT_RETURN_URL || 'https://uberclone-conductor.example/pago';

// Creates the checkout. The trip must belong to the driver, be completed and use Mercado Pago.
async function createPreference(tripId, driverId) {
  const snap = await db.collection('trips').doc(tripId).get();
  const trip = snap.exists ? snap.data() : null;
  if (!trip || trip.driverId !== driverId) throw httpError(404, 'Trip not found');
  if (trip.status !== 'completed') throw httpError(409, 'Trip is not ready to be paid');
  if (trip.paymentMethod !== 'mercadopago') throw httpError(409, 'Trip is not a Mercado Pago trip');

  const amount = Number(trip.fare) + Number(trip.tip || 0);
  const url = RETURN_URL();
  const preference = await mp('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        { id: tripId, title: 'Viaje UberClone', quantity: 1, currency_id: 'COP', unit_price: amount },
      ],
      external_reference: tripId,
      back_urls: { success: `${url}/success`, failure: `${url}/failure`, pending: `${url}/pending` },
      auto_return: 'approved',
      ...(process.env.PUBLIC_URL ? { notification_url: `${process.env.PUBLIC_URL}/webhooks/mercadopago` } : {}),
    }),
  });
  await snap.ref.update({ preferenceId: preference.id });
  // With test credentials, init_point is the checkout to use (sandbox_init_point is the legacy one)
  return { preferenceId: preference.id, initPoint: preference.init_point || preference.sandbox_init_point };
}

// Marks the trip as paid (idempotent) and credits the driver balance with the net earnings:
// the platform received the money, so it owes the driver fare - commission + tip.
async function finalizePayment(tripId, payment) {
  const tripRef = db.collection('trips').doc(tripId);
  return db.runTransaction(async (t) => {
    const tripSnap = await t.get(tripRef);
    const trip = tripSnap.exists ? tripSnap.data() : null;
    if (!trip || trip.status !== 'completed') return false; // already paid or invalid
    const driverRef = db.collection('drivers').doc(trip.driverId);
    const driverSnap = await t.get(driverRef);
    const balance = (driverSnap.exists && driverSnap.data().balance) || 0;
    t.update(tripRef, {
      status: 'paid',
      paymentStatus: 'approved',
      paymentId: String(payment.id),
      paidAt: FieldValue.serverTimestamp(),
    });
    t.update(driverRef, { balance: balance + trip.driverEarnings });
    return true;
  });
}

// Looks for the newest payment of this trip in Mercado Pago and reacts to its status.
async function confirmPayment(tripId, driverId) {
  const tripSnap = await db.collection('trips').doc(tripId).get();
  const trip = tripSnap.exists ? tripSnap.data() : null;
  if (!trip || trip.driverId !== driverId) throw httpError(404, 'Trip not found');
  if (trip.status === 'paid') return { status: 'approved', alreadyPaid: true };

  const search = await mp(
    `/v1/payments/search?external_reference=${encodeURIComponent(tripId)}&sort=date_created&criteria=desc`
  );
  const payment = (search.results || [])[0];
  if (!payment) return { status: 'pending' };
  if (payment.status === 'approved') {
    await finalizePayment(tripId, payment);
    return { status: 'approved', paymentId: String(payment.id) };
  }
  return { status: payment.status === 'rejected' ? 'rejected' : 'pending' };
}

// Webhook: Mercado Pago tells us a payment changed. We fetch it ourselves to verify it.
async function handleWebhook(body, query) {
  const type = body?.type || query?.type || query?.topic;
  const id = body?.data?.id || query?.['data.id'] || query?.id;
  if (type !== 'payment' || !id) return;
  const payment = await mp(`/v1/payments/${id}`);
  if (payment.status === 'approved' && payment.external_reference) {
    await finalizePayment(payment.external_reference, payment);
  }
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

module.exports = { createPreference, confirmPayment, handleWebhook };