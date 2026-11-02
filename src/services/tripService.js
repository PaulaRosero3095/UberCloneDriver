import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { PRICING } from '../config/pricing';
import { TRIP_STATUS } from '../config/trips';

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
  });
  return ref.id;
}
