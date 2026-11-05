// src/screens/SolicitudScreen.js
// AI-assisted: see docs/AI_LOG.md #6
// Incoming request: origin, destination, distance, duration, category, payment method,
// estimated fare and estimated net earnings, with a 15 s timer.

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Boton from '../components/Boton';
import { CATEGORY_OPTIONS } from '../config/options';
import { PAYMENT_METHOD_LABELS, REQUEST_TIMEOUT_SECONDS } from '../config/trips';
import { useTrip } from '../context/TripContext';
import { colors, fontSize, radius, spacing } from '../theme';
import { calculateFare } from '../utils/calculateFare';
import { formatCOP } from '../utils/format';

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

export default function SolicitudScreen({ navigation }) {
  const { request, secondsLeft, busy, error, acceptRequest, rejectRequest } = useTrip();

  if (!request) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{error || 'La solicitud ya no está disponible.'}</Text>
        <Boton title="Volver al inicio" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Same function used to close the trip: estimate = what the driver would earn
  const estimate = calculateFare({
    distanceKm: request.distanceKm,
    durationMin: request.durationMin,
    category: request.category,
    tip: 0,
    commissionRate: request.commissionRate,
  });
  const category = CATEGORY_OPTIONS.find((o) => o.value === request.category);
  const progress = Math.max(0, Math.min(1, secondsLeft / REQUEST_TIMEOUT_SECONDS));
  const urgent = secondsLeft <= 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.timerBox}>
        <Text style={[styles.timerNumber, urgent && styles.urgent]}>{secondsLeft}</Text>
        <Text style={styles.timerText}>segundos para responder</Text>
        <View style={styles.track}>
          <View style={[styles.bar, { width: `${progress * 100}%` }, urgent && styles.barUrgent]} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.route}>Recogida</Text>
        <Text style={styles.address}>{request.origin?.address}</Text>
        <Text style={[styles.route, styles.routeSpacing]}>Destino</Text>
        <Text style={styles.address}>{request.destination?.address}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Distancia" value={`${request.distanceKm} km`} />
        <Row label="Duración" value={`${request.durationMin} min`} />
        <Row label="Categoría" value={category ? category.label : request.category} />
        <Row label="Método de pago" value={PAYMENT_METHOD_LABELS[request.paymentMethod] || request.paymentMethod} />
        <Row label="Tarifa estimada" value={formatCOP(estimate.fare)} />
        <Row label="Ganancia neta estimada" value={formatCOP(estimate.driverEarnings)} strong />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Boton title="Aceptar" onPress={acceptRequest} loading={busy} />
        <View style={styles.gap} />
        <Boton title="Rechazar" variant="outline" onPress={rejectRequest} disabled={busy} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  empty: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  emptyText: { fontSize: fontSize.md, color: colors.textSoft, textAlign: 'center', marginBottom: spacing.lg },
  timerBox: { alignItems: 'center', marginBottom: spacing.lg },
  timerNumber: { fontSize: 56, fontWeight: '800', color: colors.text },
  urgent: { color: colors.error },
  timerText: { fontSize: fontSize.sm, color: colors.textSoft },
  track: { height: 6, alignSelf: 'stretch', backgroundColor: colors.border, borderRadius: 3, marginTop: spacing.sm },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
  barUrgent: { backgroundColor: colors.error },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  route: { fontSize: fontSize.sm, color: colors.textSoft, fontWeight: '600' },
  routeSpacing: { marginTop: spacing.md },
  address: { fontSize: fontSize.md, color: colors.text, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs + 2 },
  rowLabel: { fontSize: fontSize.md, color: colors.textSoft },
  rowValue: { fontSize: fontSize.md, color: colors.text },
  rowStrong: { fontWeight: '800', color: colors.accent },
  error: { color: colors.error, fontSize: fontSize.sm, marginBottom: spacing.md },
  actions: { marginTop: spacing.sm },
  gap: { height: spacing.md },
});
