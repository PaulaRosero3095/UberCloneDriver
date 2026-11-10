// src/screens/GananciasScreen.js
// AI-assisted: see docs/AI_LOG.md #10
// Earnings: balance + today / week / month summaries, calculated with useMemo in useEarnings.

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useDriver } from '../context/DriverContext';
import useEarnings from '../hooks/useEarnings';
import { colors, fontSize, radius, spacing } from '../theme';
import { formatCOP } from '../utils/format';

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

function PeriodCard({ title, data }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Row label="Viajes" value={String(data.count)} />
      <Row label="Total facturado" value={formatCOP(data.billed)} />
      <Row label="Comisiones" value={`- ${formatCOP(data.commissions)}`} />
      <Row label="Propinas" value={formatCOP(data.tips)} />
      <Row label="Ganancia neta" value={formatCOP(data.net)} strong />
      <Row label="Promedio por viaje" value={formatCOP(data.average)} />
    </View>
  );
}

export default function GananciasScreen() {
  const { driverId, driver } = useDriver();
  const balance = driver?.balance || 0;
  const { summary, loading, error } = useEarnings({ driverId, balance });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, styles.balanceCard]}>
        <Text style={styles.balanceLabel}>Saldo del conductor</Text>
        <Text style={styles.balanceValue}>{formatCOP(summary.balance)}</Text>
        <Text style={styles.balanceHint}>
          Ganancias de viajes pagados por pasarela menos comisiones de viajes en efectivo.
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PeriodCard title="Hoy" data={summary.today} />
      <PeriodCard title="Esta semana" data={summary.week} />
      <PeriodCard title="Este mes" data={summary.month} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  balanceCard: { backgroundColor: colors.primary, borderColor: colors.primary },
  balanceLabel: { fontSize: fontSize.sm, color: '#D1D5DB', fontWeight: '600' },
  balanceValue: { fontSize: fontSize.xl, color: '#FFFFFF', fontWeight: '800', marginTop: spacing.xs },
  balanceHint: { fontSize: fontSize.sm, color: '#D1D5DB', marginTop: spacing.sm, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs + 2 },
  rowLabel: { fontSize: fontSize.md, color: colors.textSoft },
  rowValue: { fontSize: fontSize.md, color: colors.text },
  rowStrong: { fontWeight: '800', color: colors.accent },
  error: { color: colors.error, fontSize: fontSize.sm, marginBottom: spacing.md },
});