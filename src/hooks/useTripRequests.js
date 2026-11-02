// src/hooks/useTripRequests.js
// AI-assisted: see docs/AI_LOG.md #6
// Custom hook: listens to the requests offered to the driver and runs the 15 s timer.
// Concepts: useState, useEffect WITH CLEANUP (Firestore listener + interval),
//           useMemo (current request) and useCallback (accept / reject handlers).

import { useCallback, useEffect, useMemo, useState } from 'react';

import { REQUEST_TIMEOUT_SECONDS } from '../config/trips';
import { acceptTrip, rejectTrip, subscribeToTripRequests } from '../services/tripService';

export default function useTripRequests({ driverId, enabled }) {
  const [requests, setRequests] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // The timer remembers WHICH request it belongs to, so a new request never inherits an old 0
  const [timer, setTimer] = useState({ id: null, left: REQUEST_TIMEOUT_SECONDS });

  // The request on screen is the oldest pending one
  const request = useMemo(() => requests[0] || null, [requests]);
  const requestId = request ? request.id : null;

  // 1) Real-time subscription (only while the driver is Available and approved)
  useEffect(() => {
    if (!enabled || !driverId) {
      setRequests([]);
      return undefined;
    }
    const unsubscribe = subscribeToTripRequests(
      driverId,
      (trips) => {
        setRequests(trips);
        setError('');
      },
      () => setError('No pudimos escuchar las solicitudes. Revisa tu conexión.')
    );
    return unsubscribe; // cleanup: stop listening when unavailable / unmounted
  }, [enabled, driverId]);

  // 2) Countdown: restarts for every new request
  useEffect(() => {
    if (!requestId) return undefined;
    setTimer({ id: requestId, left: REQUEST_TIMEOUT_SECONDS });
    const interval = setInterval(() => {
      setTimer((current) =>
        current.id === requestId ? { ...current, left: Math.max(0, current.left - 1) } : current
      );
    }, 1000);
    return () => clearInterval(interval); // cleanup: no timers left running
  }, [requestId]);

  const reject = useCallback(async () => {
    if (!requestId) return;
    try {
      await rejectTrip(requestId, driverId);
    } catch (e) {
      setError('No pudimos rechazar la solicitud.');
    }
  }, [requestId, driverId]);

  // Returns the trip id when accepted, or null (expired, taken by someone else, or error)
  const accept = useCallback(async () => {
    if (!requestId || busy) return null;
    setBusy(true);
    try {
      const accepted = await acceptTrip(requestId, driverId);
      if (!accepted) setError('Esta solicitud ya no está disponible.');
      return accepted ? requestId : null;
    } catch (e) {
      setError('No pudimos aceptar la solicitud. Inténtalo de nuevo.');
      return null;
    } finally {
      setBusy(false);
    }
  }, [requestId, driverId, busy]);

  // 3) At zero the request is rejected automatically (PDF section 3)
  useEffect(() => {
    if (requestId && timer.id === requestId && timer.left <= 0) reject();
  }, [requestId, timer.id, timer.left, reject]);

  const secondsLeft = timer.id === requestId ? timer.left : REQUEST_TIMEOUT_SECONDS;

  return { request, secondsLeft, busy, error, accept, reject };
}
