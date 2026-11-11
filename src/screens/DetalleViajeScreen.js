import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Marker, Polyline } from 'react-native-maps';

import MapaBase from '../components/MapaBase';
import { CATEGORY_OPTIONS } from '../config/options';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../config/trips';
import { colors, fontSize, radius, spacing } from '../theme';
import { formatCOP, formatPercent } from '../utils/format';

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

const point = (place) => ({ latitude: place.lat, longitude: place.lng });

export default function DetalleViajeScreen({ route }) {
  const { trip } = route.params;
  const category = CATEGORY_OPTIONS.find((o) => o.value === trip.category);

  return (
    <ScrollView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapaBase
          initialRegion={{
            latitude: (trip.origin.lat + trip.destination.lat) / 2,
            longitude: (trip.origin.lng + trip.destination.lng) / 2,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={point(trip.origin)} title="Recogida" pinColor="green" />
          <Marker coordinate={point(trip.destination)} title="Destino" pinColor="red" />
          {trip.polyline && <Polyline coordinates={trip.polyline} strokeColor={colors.primary} strokeWidth={4} />}
        </MapaBase>
      </View>

      {/* Details Section */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen del viaje</Text>
          <Row label="Categoría" value={category ? category.label : trip.category} />
          <Row label="Distancia" value={`${trip.distanceKm} km`} />
          <Row label="Duración" value={`${trip.durationMin} min`} />
          <Row label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod]} />
          <Row label="Estado del pago" value={PAYMENT_STATUS_LABELS[trip.paymentStatus] || trip.status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Finanzas</Text>
          <Row label="Tarifa final" value={formatCOP(trip.fare)} />
          <Row label={`Comisión (${formatPercent(trip.commissionRate)})`} value={`- ${formatCOP(trip.commission)}`} />
          <Row label="Propina" value={formatCOP(trip.tip || 0)} />
          <Row label="Ganancia neta" value={formatCOP(trip.driverEarnings)} strong />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calificación del pasajero</Text>
          <Row label="Estrellas" value={trip.rating ? `${trip.rating} / 5 ★` : 'Sin calificación'} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapContainer: { height: 250, width: '100%' },
  content: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs + 2 },
  rowLabel: { fontSize: fontSize.md, color: colors.textSoft },
  rowValue: { fontSize: fontSize.md, color: colors.text },
  rowStrong: { fontWeight: '800', color: colors.accent },
});