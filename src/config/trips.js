// src/config/trips.js
// AI-assisted: see docs/AI_LOG.md #6
// Trip constants shared by the whole app.

// Seconds the driver has to accept a request before it is rejected automatically
export const REQUEST_TIMEOUT_SECONDS = 15;

// Values of the `status` field of a trip (PDF section 3)
export const TRIP_STATUS = {
  requested: 'requested',
  accepted: 'accepted',
  driverArriving: 'driver_arriving',
  inProgress: 'in_progress',
  completed: 'completed',
  paid: 'paid',
  cancelled: 'cancelled',
  rejected: 'rejected',
};

export const PAYMENT_METHOD_LABELS = {
  mercadopago: 'Mercado Pago',
  stripe: 'Stripe',
  cash: 'Efectivo',
};
