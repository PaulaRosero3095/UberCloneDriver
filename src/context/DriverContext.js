import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setDriverAvailability, subscribeToDriver } from '../services/driverService';
import { savePreference } from '../services/preferencesService';
import { clearSession, loadDriverId, saveDriverId } from '../services/sessionService';

const DriverContext = createContext(null);

export function DriverProvider({ children }) {
  const [driverId, setDriverId] = useState(null);
  const [driver, setDriver] = useState(null);
  const [restoring, setRestoring] = useState(true); // reading the saved session
  const [error, setError] = useState('');

  // 1) Restore the session once when the app opens
  useEffect(() => {
    let active = true;
    loadDriverId().then((savedId) => {
      if (!active) return;
      setDriverId(savedId);
      setRestoring(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // 2) Listen to the driver document while there is a session
  useEffect(() => {
    if (!driverId) {
      setDriver(null);
      return undefined;
    }
    const unsubscribe = subscribeToDriver(
      driverId,
      (data) => {
        setDriver(data);
        setError('');
      },
      () => setError('No pudimos cargar tu perfil. Revisa tu conexión.')
    );
    return unsubscribe; // cleanup: stop listening on logout / unmount
  }, [driverId]);

  const signIn = useCallback(async (id) => {
    await saveDriverId(id);
    setDriverId(id);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setDriverId(null);
  }, []);

  const isApproved = driver?.status === 'approved';

  const toggleAvailability = useCallback(async () => {
    if (!driverId || !isApproved) return; // pending drivers cannot go available
    try {
      const next = !driver.isAvailable;
      await setDriverAvailability(driverId, next);
      savePreference('lastAvailability', next); // preference kept in AsyncStorage
    } catch (e) {
      setError('No pudimos cambiar tu disponibilidad. Inténtalo de nuevo.');
    }
  }, [driverId, isApproved, driver]);

  const value = useMemo(
    () => ({ driverId, driver, restoring, error, isApproved, signIn, signOut, toggleAvailability }),
    [driverId, driver, restoring, error, isApproved, signIn, signOut, toggleAvailability]
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (!context) throw new Error('useDriver must be used inside <DriverProvider>');
  return context;
}