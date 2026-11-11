// src/screens/CobroScreen.js
// AI-assisted: see docs/AI_LOG.md #8
// Trip summary: final fare, commission, net earnings and payment status.
// Cash: the driver marks the payment as received and the commission is discounted from the balance.
// Mercado Pago: opens the checkout in a WebView; the backend verifies the payment.

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Boton from '../components/Boton';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, TRIP_STATUS } from '../config/trips';
import { goHome, useTrip } from '../context/TripContext';
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

export default function CobroScreen({ navigation, route }) {
  const { activeTrip, actionBusy, actionError, collectCash } = useTrip();
  // Once the trip is paid it is no longer "active": keep the last data on screen
  const [trip, setTrip] = useState(null);
  const [paid, setPaid] = useState(false);

  // Coming back from a successful Mercado Pago checkout
  useEffect(() => {
    if (route?.params?.paid) setPaid(true);
  }, [route?.params?.paid]);

  useEffect(() => {
    if (activeTrip) setTrip(activeTrip);
  }, [activeTrip]);

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No hay un viaje por cobrar.</Text>
        <View style={styles.spacer} />
        <Boton title="Volver al inicio" onPress={goHome} />
      </View>
    );
  }

  const isCash = trip.paymentMethod === 'cash';
  const isPaid = paid || trip.status === TRIP_STATUS.paid;
  const paymentStatus = isPaid ? (isCash ? 'cash' : 'approved') : 'pending';

  const handleCollect = async () => {
    const done = await collectCash();
    if (done) setPaid(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isPaid ? 'Viaje cobrado' : 'Viaje finalizado'}</Text>

      <View style={styles.card}>
        <Row label="Tarifa final" value={formatCOP(trip.fare)} />
        <Row label={`Comisión (${formatPercent(trip.commissionRate)})`} value={`- ${formatCOP(trip.commission)}`} />
        {trip.tip ? <Row label="Propina" value={formatCOP(trip.tip)} /> : null}
        <Row label="Ganancia neta" value={formatCOP(trip.driverEarnings)} strong />
      </View>

      <View style={styles.card}>
        <Row label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod] || trip.paymentMethod} />
        <Row label="Estado del pago" value={PAYMENT_STATUS_LABELS[paymentStatus]} />
      </View>

      {isCash && !isPaid ? (
        <Text style={styles.note}>
          Al confirmar que recibiste el efectivo, la comisión de {formatCOP(trip.commission)} se descuenta
          de tu saldo.
        </Text>
      ) : null}
      {!isCash && !isPaid ? (
        <Text style={styles.note}>
          El pasajero paga con la pasarela. Al aprobarse, tu ganancia neta se suma a tu saldo.
        </Text>
      ) : null}
      {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

      <View style={styles.actions}>
        {isPaid ? (
          <Boton title="Volver al inicio" onPress={goHome} />
        ) : isCash ? (
          <Boton title="Cobro recibido en efectivo" onPress={handleCollect} loading={actionBusy} />
        ) : (
          <Boton
            title="Pagar con Mercado Pago"
            onPress={() => navigation.navigate('PagoMercadoPago', { tripId: trip.id })}
          />
        )}
        {!isPaid ? (
          <>
            <View style={styles.spacer} />
            <Boton title="Volver al inicio" variant="outline" onPress={goHome} />
            <Text style={styles.note}>El cobro queda pendiente; la app volverá a mostrarlo al abrirla.</Text>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs + 2 },
  rowLabel: { fontSize: fontSize.md, color: colors.textSoft },
  rowValue: { fontSize: fontSize.md, color: colors.text },
  rowStrong: { fontWeight: '800', color: colors.accent },
  muted: { fontSize: fontSize.md, color: colors.textSoft },
  note: { fontSize: fontSize.sm, color: colors.textSoft, marginBottom: spacing.md },
  error: { color: colors.error, fontSize: fontSize.sm, marginBottom: spacing.md },
  spacer: { height: spacing.md },
  actions: { marginTop: spacing.sm },
});