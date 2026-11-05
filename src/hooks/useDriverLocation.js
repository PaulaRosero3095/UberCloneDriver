// src/hooks/useDriverLocation.js
// AI-assisted: see docs/AI_LOG.md #6
// Custom hook with the device position (@react-native-community/geolocation).
//  - Always reads the position ONCE (so the map can show where the driver is).
//  - Follows it continuously (watchPosition) ONLY while `follow` is true.
// Concepts: useState + useEffect WITH CLEANUP (clearWatch) + useCallback.

import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// permission: 'unknown' | 'granted' | 'denied'
export default function useDriverLocation({ follow = false } = {}) {
  const [location, setLocation] = useState(null); // { latitude, longitude, heading, speed }
  const [permission, setPermission] = useState('unknown');
  const [error, setError] = useState('');

  const requestPermission = useCallback(async () => {
    try {
      if (Platform.OS !== 'android') {
        setPermission('granted');
        return true;
      }
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const granted = result === PermissionsAndroid.RESULTS.GRANTED;
      setPermission(granted ? 'granted' : 'denied');
      if (!granted) setError('Necesitamos tu ubicación para mostrarte en el mapa.');
      return granted;
    } catch (e) {
      setPermission('denied');
      setError('No pudimos pedir el permiso de ubicación.');
      return false;
    }
  }, []);

  const handlePosition = useCallback((position) => {
    const { latitude, longitude, heading, speed } = position.coords;
    setLocation({ latitude, longitude, heading, speed });
    setError('');
  }, []);

  const handleError = useCallback(() => {
    setError('No pudimos obtener tu ubicación. ¿Tienes el GPS encendido?');
  }, []);

  // 1) Permission + one reading when the hook starts
  useEffect(() => {
    let active = true;
    (async () => {
      const granted = await requestPermission();
      if (!granted || !active) return;
      Geolocation.getCurrentPosition(
        (position) => active && handlePosition(position),
        () => active && handleError(),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    })();
    return () => {
      active = false;
    };
  }, [requestPermission, handlePosition, handleError]);

  // 2) Continuous tracking, only while `follow` is true
  useEffect(() => {
    if (!follow || permission !== 'granted') return undefined;

    const watchId = Geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      distanceFilter: 5,
      interval: 3000,
      fastestInterval: 2000,
    });

    // Cleanup: stops when the driver is not Available, leaves the screen or unmounts
    return () => Geolocation.clearWatch(watchId);
  }, [follow, permission, handlePosition, handleError]);

  return { location, permission, error, tracking: follow && permission === 'granted' };
}
