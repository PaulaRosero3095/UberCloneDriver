// backend/src/tripWatcher.js
// AI-assisted: see docs/AI_LOG.md #14
// Sends an FCM push to the driver when a trip request appears (status "requested").
// There is no passenger app, so watching Firestore replaces "the passenger's server".

const { db, messaging, FieldValue } = require('./firebase');

const MAX_AGE_MS = 60 * 1000; // ignore old pending requests found when the server starts

const money = (n) => `$${Math.round(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

async function notifyDriver(tripRef, trip) {
  const driverSnap = await db.collection('drivers').doc(trip.driverId).get();
  const driver = driverSnap.exists ? driverSnap.data() : null;
  if (!driver || !driver.fcmToken || driver.status !== 'approved' || !driver.isAvailable) {
    console.log(`[push] trip ${tripRef.id}: driver not reachable, skipped`);
    return;
  }
  const destination = trip.destination?.address || 'destino';
  await messaging.send({
    token: driver.fcmToken,
    notification: {
      title: 'Nueva solicitud de viaje',
      body: `${trip.origin?.address || 'Origen'} → ${destination} · ${trip.distanceKm ?? '?'} km`,
    },
    data: { tripId: tripRef.id, type: 'trip_request' },
    android: { priority: 'high' },
  });
  await tripRef.update({ notifiedAt: FieldValue.serverTimestamp() });
  console.log(`[push] trip ${tripRef.id}: notification sent to driver ${trip.driverId}`);
}

function startTripWatcher() {
  const seen = new Set();
  return db
    .collection('trips')
    .where('status', '==', 'requested')
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type !== 'added') return;
          const trip = change.doc.data();
          if (seen.has(change.doc.id) || trip.notifiedAt) return;
          const created = trip.createdAt?.toMillis?.() ?? Date.now();
          if (Date.now() - created > MAX_AGE_MS) return;
          seen.add(change.doc.id);
          notifyDriver(change.doc.ref, trip).catch((e) => console.error('[push] failed:', e.message));
        });
      },
      (e) => console.error('[push] watcher error:', e.message)
    );
}

module.exports = { startTripWatcher };
