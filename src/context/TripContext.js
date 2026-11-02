// src/context/TripContext.js
// AI-assisted: see docs/AI_LOG.md #6
// Incoming request + active trip, available to every screen.
// It opens the "Solicitud" screen when a request arrives and closes it when the request
// disappears (rejected, expired or accepted).

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import useTripRequests from '../hooks/useTripRequests';
import { navigationRef } from '../navigation/navigationRef';
import { subscribeToTrip } from '../services/tripService';
import { useDriver } from './DriverContext';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { driverId, driver, isApproved } = useDriver();
  // Requests are only listened to while the driver is approved AND Available
  const enabled = isApproved && !!driver?.isAvailable;

  const { request, secondsLeft, busy, error, accept, reject } = useTripRequests({ driverId, enabled });

  const [activeTripId, setActiveTripId] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const acceptingRef = useRef(false);

  const requestId = request ? request.id : null;

  // Open / close the request screen
  useEffect(() => {
    if (!navigationRef.isReady()) return;
    const current = navigationRef.getCurrentRoute()?.name;
    if (requestId) {
      if (current !== 'Solicitud') navigationRef.navigate('Solicitud');
    } else if (current === 'Solicitud' && !acceptingRef.current && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }, [requestId]);

  // Real-time listener of the active trip (cleanup on change / unmount)
  useEffect(() => {
    if (!activeTripId) {
      setActiveTrip(null);
      return undefined;
    }
    return subscribeToTrip(activeTripId, setActiveTrip, () => {});
  }, [activeTripId]);

  const acceptRequest = useCallback(async () => {
    acceptingRef.current = true;
    const tripId = await accept();
    if (tripId) {
      setActiveTripId(tripId);
      navigationRef.navigate('ViajeEnCurso');
    } else if (navigationRef.getCurrentRoute()?.name === 'Solicitud' && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
    acceptingRef.current = false;
    return !!tripId;
  }, [accept]);

  const value = useMemo(
    () => ({ request, secondsLeft, busy, error, acceptRequest, rejectRequest: reject, activeTrip }),
    [request, secondsLeft, busy, error, acceptRequest, reject, activeTrip]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used inside <TripProvider>');
  return context;
}
