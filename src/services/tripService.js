// src/services/tripService.js
// AI-assisted: see docs/AI_LOG.md #8
// The ONLY place that talks to the "trips" collection. Screens and hooks never import Firestore.

import { addDoc, collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

import { db } from '../config/firebase';
import { PRICING } from '../config/pricing';
import { ACTIVE_STATUSES, TRIP_STATUS } from '../config/trips';

const tripsRef = () => collection(db, 'trips');

// Real-time list of the requests offered to this driver (status "requested")
export function subscribeToTripRequests(driverId, onData, onError) {
  const q = query(
    tripsRef(),
    where('driverId', '==', driverId),
    where('status', '==', TRIP_STATUS.requested)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Oldest first (createdAt is null for a moment while the server writes it)
      trips.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
      onData(trips);
    },
    onError
  );
}

// Real-time listener for one trip (the active trip)
export function subscribeToTrip(tripId, onData, onError) {
  return onSnapshot(
    doc(db, 'trips', tripId),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError
  );
}

// Moves a request from "requested" to a new status ONLY if it is still "requested" and
// still belongs to this driver (another device or the timer may have changed it first).
async function answerRequest(tripId, driverId, nextStatus, extraFields) {
  const ref = doc(db, 'trips', tripId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const trip = snapshot.exists() ? snapshot.data() : null;
    if (!trip || trip.status !== TRIP_STATUS.requested || trip.driverId !== driverId) return false;
    transaction.update(ref, { status: nextStatus, ...extraFields });
    return true;
  });
}

export function acceptTrip(tripId, driverId) {
  return answerRequest(tripId, driverId, TRIP_STATUS.accepted, { acceptedAt: serverTimestamp() });
}

export function rejectTrip(tripId, driverId) {
  return answerRequest(tripId, driverId, TRIP_STATUS.rejected, { rejectedAt: serverTimestamp() });
}

// TESTING ONLY: there is no passenger app, so this creates a request like the passenger would.
export async function createTestTrip(driverId) {
  const ref = await addDoc(tripsRef(), {
    driverId,
    passengerId: 'test-passenger',
    origin: { lat: 4.6486, lng: -74.0628, address: 'Parque de la 93, Bogotá' },
    destination: { lat: 4.6097, lng: -74.082, address: 'Plaza de Bolívar, Bogotá' },
    distanceKm: 8.5,
    durationMin: 22,
    category: 'economy',
    paymentMethod: 'cash',
    commissionRate: PRICING.commissionRate,
    tip: 0,
    status: TRIP_STATUS.requested,
    createdAt: serverTimestamp(),
    // Fake polyline for testing the history detail
    polyline: [
      { latitude: 4.6486, longitude: -74.0628 },
      { latitude: 4.6300, longitude: -74.0700 },
      { latitude: 4.6097, longitude: -74.0820 }
    ],
    rating: 5,
  });
  return ref.id;
}

// Real-time listener of the driver's active trip (accepted ... completed, not paid yet).
// Calls onData with the newest one, or null when there is none.
export function subscribeToActiveTrip(driverId, onData, onError) {
  const q = query(
    tripsRef(),
    where('driverId', '==', driverId),
    where('status', 'in', ACTIVE_STATUSES)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      trips.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      onData(trips[0] || null);
    },
    onError
  );
}

// Changes the status of a trip ONLY if it is still in one of the expected statuses and belongs
// to this driver. Returns false when the trip already changed (nothing is written).
export function moveTrip(tripId, driverId, fromStatuses, toStatus, extraFields = {}) {
  const ref = doc(db, 'trips', tripId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const trip = snapshot.exists() ? snapshot.data() : null;
    if (!trip || trip.driverId !== driverId || !fromStatuses.includes(trip.status)) return false;
    transaction.update(ref, { status: toStatus, ...extraFields });
    return true;
  });
}

// Cash payment: the platform did not receive the money, so the commission is discounted
// from the driver balance (it can become negative). Trip and balance change together.
export function payTripInCash(tripId, driverId) {
  const tripRef = doc(db, 'trips', tripId);
  const driverRef = doc(db, 'drivers', driverId);
  return runTransaction(db, async (transaction) => {
    const tripSnapshot = await transaction.get(tripRef);
    const driverSnapshot = await transaction.get(driverRef);
    const trip = tripSnapshot.exists() ? tripSnapshot.data() : null;
    if (
      !trip ||
      trip.driverId !== driverId ||
      trip.status !== TRIP_STATUS.completed ||
      trip.paymentMethod !== 'cash'
    ) {
      return false;
    }
    const balance = (driverSnapshot.exists() && driverSnapshot.data().balance) || 0;
    transaction.update(tripRef, {
      status: TRIP_STATUS.paid,
      paymentStatus: 'cash',
      paidAt: serverTimestamp(),
    });
    transaction.update(driverRef, { balance: balance - trip.commission });
    return true;
  });
}

// Fetch historical trips with pagination (20 at a time)
export async function getHistoricalTrips(driverId, lastVisibleDoc = null) {
  let q = query(
    tripsRef(),
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  if (lastVisibleDoc) {
    q = query(q, startAfter(lastVisibleDoc));
  }

  const snapshot = await getDocs(q);
  const trips = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];

  return { trips, lastDoc };
}