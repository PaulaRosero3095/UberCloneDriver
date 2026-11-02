import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// permission: 'unknown' | 'granted' | 'denied'
export default function useDriverLocation({ enabled = true } = {}) {
  const [location, setLocation] = useState(null); // { latitude, longitude, heading, speed }
  const [permission, setPermission] = useState('unknown');
  const [error, setError] = useState('');

  const requestPermission = useCallback(async () => {
    try {
      if (Platform.OS !== 'android') {
        setPermission('granted');
        return true;
      }
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
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

  useEffect(() => {
    if (!enabled) return undefined;

    let watchId = null;
    let active = true; // avoids updating state after the screen is gone

    (async () => {
      const granted = await requestPermission();
      if (!granted || !active) return;

      watchId = Geolocation.watchPosition(
        (position) => {
          if (!active) return;
          const { latitude, longitude, heading, speed } = position.coords;
          setLocation({ latitude, longitude, heading, speed });
          setError('');
        },
        () => active && setError('No pudimos obtener tu ubicación. ¿Tienes el GPS encendido?'),
        { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
      );
    })();

    // Cleanup: stop following the position
    return () => {
      active = false;
      if (watchId !== null) Geolocation.clearWatch(watchId);
    };
  }, [enabled, requestPermission]);

  return { location, permission, error, requestPermission };
}
