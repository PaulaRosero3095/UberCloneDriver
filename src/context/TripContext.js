// src/context/TripContext.js
// AI-assisted: see docs/AI_LOG.md #8
// Incoming request + ACTIVE TRIP, available to every screen (PDF: useContext for the active trip).
// The screen shown depends on the trip status:
//   request            -> Solicitud
//   accepted / driver_arriving / in_progress -> ViajeEnCurso
//   completed (not paid yet)                 -> Cobro

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { TRIP_STATUS } from '../config/trips';
import useTripRequests from '../hooks/useTripRequests';
import { navigationRef } from '../navigation/navigationRef';
import { moveTrip, payTripInCash, subscribeToActiveTrip } from '../services/tripService';
import { calculateFare } from '../utils/calculateFare';
import { useDriver } from './DriverContext';

const TripContext = createContext(null);

const screenFor = (status) => (status === TRIP_STATUS.completed ? 'Cobro' : 'ViajeEnCurso');

// Replaces the whole stack so the driver cannot go "back" to a closed screen
const goTo = (screen) => navigationRef.reset({ index: 1, routes: [{ name: 'Main' }, { name: screen }] });
const goHome = () => navigationRef.reset({ index: 0, routes: [{ name: 'Main' }] });

export function TripProvider({ children }) {
  const { driverId, driver, isApproved } = useDriver();
  const [activeTrip, setActiveTrip] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const arrivingSent = useRef(null); // trip id whose "driver_arriving" was already sent

  // 1) Active trip listener (cleanup on logout / unmount)
  useEffect(() => {
    if (!driverId) {
      setActiveTrip(null);
      return undefined;
    }
    return subscribeToActiveTrip(driverId, setActiveTrip, () => {});
  }, [driverId]);

  // Requests are only listened to while approved, Available and without an active trip
  const enabled = isApproved && !!driver?.isAvailable && !activeTrip;
  const { request, secondsLeft, busy, error, accept, reject } = useTripRequests({ driverId, enabled });

  const requestId = request ? request.id : null;

  // 2) Open / close the request screen
  useEffect(() => {
    if (!navigationRef.isReady()) return;
    const current = navigationRef.getCurrentRoute()?.name;
    if (requestId) {
      if (current !== 'Solicitud' && !activeTrip) navigationRef.navigate('Solicitud');
    } else if (current === 'Solicitud' && !activeTrip && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }, [requestId, activeTrip]);

  // 3) Show the screen that matches the active trip (also when the app is reopened mid-trip)
  const activeId = activeTrip ? activeTrip.id : null;
  const activeStatus = activeTrip ? activeTrip.status : null;
  useEffect(() => {
    let timer = null;
    let tries = 0;
    const sync = () => {
      if (!navigationRef.isReady()) {
        if (tries++ < 10) timer = setTimeout(sync, 500); // the navigator may not be ready yet
        return;
      }
      const current = navigationRef.getCurrentRoute()?.name;
      if (activeStatus) {
        const target = screenFor(activeStatus);
        if (current !== target) goTo(target);
      } else if (current === 'ViajeEnCurso') {
        goHome(); // the trip was cancelled
      }
    };
    sync();
    return () => clearTimeout(timer);
  }, [activeId, activeStatus]);

  // 4) accepted -> driver_arriving (the driver is heading to the pickup point)
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== TRIP_STATUS.accepted) return;
    if (arrivingSent.current === activeTrip.id) return;
    arrivingSent.current = activeTrip.id;
    moveTrip(activeTrip.id, driverId, [TRIP_STATUS.accepted], TRIP_STATUS.driverArriving).catch(() => {
      arrivingSent.current = null;
    });
  }, [activeTrip, driverId]);

  // Runs a trip action showing a busy state and an error message
  const run = useCallback(async (action) => {
    setActionBusy(true);
    setActionError('');
    try {
      const done = await action();
      if (!done) setActionError('El viaje ya cambió de estado.');
      return done;
    } catch (e) {
      setActionError('No pudimos completar la acción. Revisa tu conexión.');
      return false;
    } finally {
      setActionBusy(false);
    }
  }, []);

  const markPassengerOnBoard = useCallback(
    () =>
      run(() =>
        moveTrip(
          activeTrip.id,
          driverId,
          [TRIP_STATUS.accepted, TRIP_STATUS.driverArriving],
          TRIP_STATUS.inProgress,
          { startedAt: new Date() }
        )
      ),
    [run, activeTrip, driverId]
  );

  // Final fare with the SAME function used for the estimate; the commission rate of the trip is kept
  const finishTrip = useCallback(
    () =>
      run(() => {
        const result = calculateFare({
          distanceKm: activeTrip.distanceKm,
          durationMin: activeTrip.durationMin,
          category: activeTrip.category,
          tip: activeTrip.tip || 0,
          commissionRate: activeTrip.commissionRate,
        });
        return moveTrip(activeTrip.id, driverId, [TRIP_STATUS.inProgress], TRIP_STATUS.completed, {
          fare: result.fare,
          commission: result.commission,
          driverEarnings: result.driverEarnings,
          completedAt: new Date(),
        });
      }),
    [run, activeTrip, driverId]
  );

  const cancelActiveTrip = useCallback(
    () =>
      run(() =>
        moveTrip(
          activeTrip.id,
          driverId,
          [TRIP_STATUS.accepted, TRIP_STATUS.driverArriving],
          TRIP_STATUS.cancelled,
          { cancelledAt: new Date(), cancelledBy: 'driver' }
        )
      ),
    [run, activeTrip, driverId]
  );

  const collectCash = useCallback(
    () => run(() => payTripInCash(activeTrip.id, driverId)),
    [run, activeTrip, driverId]
  );

  const value = useMemo(
    () => ({
      request,
      secondsLeft,
      busy,
      error,
      acceptRequest: accept,
      rejectRequest: reject,
      activeTrip,
      actionBusy,
      actionError,
      markPassengerOnBoard,
      finishTrip,
      cancelActiveTrip,
      collectCash,
    }),
    [
      request, secondsLeft, busy, error, accept, reject, activeTrip, actionBusy, actionError,
      markPassengerOnBoard, finishTrip, cancelActiveTrip, collectCash,
    ]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used inside <TripProvider>');
  return context;
}

export { goHome };
