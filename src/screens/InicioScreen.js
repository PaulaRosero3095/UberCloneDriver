import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';

import { useDriver } from '../context/DriverContext';
import useDriverLocation from '../hooks/useDriverLocation';
import { updateDriverLocation } from '../services/driverService';
import { colors, fontSize, radius, spacing } from '../theme';

const FALLBACK_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.05, longitudeDelta: 0.05 };
const SAVE_EVERY_MS = 15000;

// With a Google key the map uses Google Maps; without it, free OpenStreetMap tiles
const HAS_GOOGLE_KEY = !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export default function InicioScreen() {
  const { driverId, driver, isApproved, error, toggleAvailability } = useDriver();
  const { location, permission, error: locationError } = useDriverLocation();
  const mapRef = useRef(null);
  const lastSavedAt = useRef(0);

  // Move the camera to the driver when the position changes
  useEffect(() => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      500
    );
  }, [location]);

  // Save the position only while Available (throttled)
  useEffect(() => {
    if (!location || !driver?.isAvailable) return;
    const now = Date.now();
    if (now - lastSavedAt.current < SAVE_EVERY_MS) return;
    lastSavedAt.current = now;
    updateDriverLocation(driverId, location).catch(() => {});
  }, [location, driver?.isAvailable, driverId]);

  if (!driver) {
    return (
      <View style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={colors.primary} />}
      </View>
    );
  }

  const message = error || locationError;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={HAS_GOOGLE_KEY ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        mapType={HAS_GOOGLE_KEY ? 'standard' : 'none'}
        initialRegion={FALLBACK_REGION}
      >
        {!HAS_GOOGLE_KEY && <UrlTile urlTemplate={OSM_TILES} maximumZ={19} tileSize={256} />}
        {location && (
          <Marker coordinate={location} title="Tú" pinColor={colors.accent} />
        )}
      </MapView>

      {!HAS_GOOGLE_KEY && <Text style={styles.attribution}>© OpenStreetMap contributors</Text>}

      <View style={styles.panel}>
        <Text style={styles.hello}>Hola, {driver.personal.fullName.split(' ')[0]}</Text>

        {isApproved ? (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{driver.isAvailable ? 'Disponible' : 'No disponible'}</Text>
              <Text style={styles.cardText}>
                {driver.isAvailable ? 'Recibirás solicitudes de viaje.' : 'Actívate para recibir solicitudes.'}
              </Text>
            </View>
            <Switch
              value={driver.isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ true: colors.accent }}
            />
          </View>
        ) : (
          <View>
            <Text style={styles.cardTitle}>Pendiente de aprobación</Text>
            <Text style={styles.cardText}>
              Estamos revisando tus documentos. Cuando tu cuenta sea aprobada podrás ponerte Disponible.
            </Text>
          </View>
        )}

        {permission === 'denied' ? (
          <Text style={styles.error}>Activa el permiso de ubicación en los ajustes del teléfono.</Text>
        ) : null}
        {message ? <Text style={styles.error}>{message}</Text> : null}
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
  attribution: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 10,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: spacing.xs,
  },
  hello: { fontSize: fontSize.sm, color: colors.textSoft, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1, paddingRight: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  cardText: { marginTop: spacing.xs, fontSize: fontSize.md, color: colors.textSoft },
  error: { marginTop: spacing.md, color: colors.error, fontSize: fontSize.sm },
});