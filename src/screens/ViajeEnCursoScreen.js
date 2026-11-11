// src/screens/ViajeEnCursoScreen.js
// AI-assisted: see docs/AI_LOG.md #8
// Trip in progress: route to the pickup point; "Pasajero a bordo" switches the route to the
// destination; "Finalizar viaje" closes the trip with fare, commission and net earnings.

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import Boton from '../components/Boton';
import MapaBase from '../components/MapaBase';
import { TRIP_STATUS } from '../config/trips';
import { useDriver } from '../context/DriverContext';
import { useTrip } from '../context/TripContext';
import useDriverLocation from '../hooks/useDriverLocation';
import { getRoute } from '../services/routeService';
import { updateDriverLocation } from '../services/driverService';
import { colors, fontSize, radius, spacing } from '../theme';

const SAVE_EVERY_MS = 5000;

const point = (place) => ({ latitude: place.lat, longitude: place.lng });

export default function ViajeEnCursoScreen() {
  const { driverId } = useDriver();
  const { activeTrip: trip, actionBusy, actionError, markPassengerOnBoard, finishTrip, cancelActiveTrip } =
    useTrip();
  // Own tracking while this screen is open (stops when it closes: effect cleanup in the hook)
  const { location } = useDriverLocation({ follow: true });
  const mapRef = useRef(null);
  const locationRef = useRef(null);
  const [route, setRoute] = useState(null); // { key, coordinates, distanceKm, durationMin, fallback }

  const tripId = trip ? trip.id : null;
  const onBoard = trip ? trip.status === TRIP_STATUS.inProgress : false;
  const phase = onBoard ? 'destination' : 'pickup';
  const hasLocation = !!location;

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // The position is saved every few seconds while the trip lasts
  useEffect(() => {
    if (!driverId || !tripId) return undefined;
    const send = () => {
      if (locationRef.current) updateDriverLocation(driverId, locationRef.current).catch(() => {});
    };
    send();
    const interval = setInterval(send, SAVE_EVERY_MS);
    return () => clearInterval(interval);
  }, [driverId, tripId]);

  // The route is requested ONCE per leg (pickup / destination), never on every movement
  useEffect(() => {
    if (!trip) return undefined;
    const from = phase === 'pickup' ? locationRef.current : point(trip.origin);
    if (!from) return undefined; // waiting for the first position
    const to = phase === 'pickup' ? point(trip.origin) : point(trip.destination);
    const key = `${tripId}:${phase}`;
    let active = true;
    getRoute(from, to)
      .then((result) => active && setRoute({ key, ...result }))
      .catch(() => active && setRoute({ key, coordinates: [from, to], fallback: true }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, phase, hasLocation]);

  // Fit the map to the route
  useEffect(() => {
    if (!route || !mapRef.current) return;
    mapRef.current.fitToCoordinates(route.coordinates, {
      edgePadding: { top: 60, right: 40, bottom: 260, left: 40 },
      animated: true,
    });
  }, [route]);

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No hay un viaje activo.</Text>
      </View>
    );
  }

  const currentRoute = route && route.key === `${tripId}:${phase}` ? route : null;
  const target = phase === 'pickup' ? trip.origin : trip.destination;

  return (
    <View style={styles.container}>
      <MapaBase ref={mapRef}>
        {currentRoute && (
          <Polyline coordinates={currentRoute.coordinates} strokeColor={colors.primary} strokeWidth={5} />
        )}
        <Marker coordinate={point(trip.origin)} title="Recogida" pinColor="green" />
        <Marker coordinate={point(trip.destination)} title="Destino" pinColor="red" />
        {location && <Marker coordinate={location} title="Tú" pinColor="blue" />}
      </MapaBase>

      <View style={styles.panel}>
        <Text style={styles.step}>{onBoard ? 'Pasajero a bordo' : 'Ve hacia la recogida'}</Text>
        <Text style={styles.address}>{target.address}</Text>
        {currentRoute && !currentRoute.fallback ? (
          <Text style={styles.muted}>
            {currentRoute.distanceKm.toFixed(1)} km · {Math.max(1, Math.round(currentRoute.durationMin))} min
          </Text>
        ) : (
          <Text style={styles.muted}>
            {currentRoute && currentRoute.fallback
              ? 'No pudimos calcular la ruta; se muestra una línea recta.'
              : 'Calculando ruta...'}
          </Text>
        )}

        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        <View style={styles.actions}>
          {onBoard ? (
            <Boton title="Finalizar viaje" onPress={() => finishTrip(currentRoute?.coordinates || [])} loading={actionBusy} />
          ) : (
            <>
              <Boton title="Pasajero a bordo" onPress={markPassengerOnBoard} loading={actionBusy} />
              <View style={styles.gap} />
              <Boton title="Cancelar viaje" variant="outline" onPress={cancelActiveTrip} disabled={actionBusy} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  panel: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  step: { fontSize: fontSize.sm, fontWeight: '700', color: colors.accent },
  address: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginTop: 2 },
  muted: { fontSize: fontSize.md, color: colors.textSoft, marginTop: spacing.xs },
  error: { marginTop: spacing.sm, color: colors.error, fontSize: fontSize.sm },
  actions: { marginTop: spacing.md },
  gap: { height: spacing.sm },
});
