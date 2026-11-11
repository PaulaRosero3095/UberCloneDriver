// src/screens/HistorialScreen.js
// AI-assisted: see docs/AI_LOG.md #2
// Placeholder: the real screen is built in a later step.


import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useDriver } from '../context/DriverContext';
import useTripHistory from '../hooks/useTripHistory';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../config/trips';
import { colors, fontSize, radius, spacing } from '../theme';
import { formatCOP, formatDate } from '../utils/format';

const DATE_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
];

export default function HistorialScreen({ navigation }) {
  const { driverId } = useDriver();
  const {
    trips, loading, refreshing, loadingMore, error,
    dateFilter, setDateFilter, paymentFilter, setPaymentFilter,
    onRefresh, loadMore,
  } = useTripHistory(driverId);

  const renderItem = ({ item }) => {
    const date = item.completedAt?.toDate?.() || item.createdAt?.toDate?.() || new Date();
    const isCash = item.paymentMethod === 'cash';
    
    return (
      <Pressable 
        style={styles.card} 
        onPress={() => navigation.navigate('DetalleViaje', { trip: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.date}>{formatDate(date)} - {date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}</Text>
          <View style={[styles.badge, isCash ? styles.badgeCash : styles.badgeCard]}>
            <Text style={styles.badgeText}>{PAYMENT_METHOD_LABELS[item.paymentMethod]}</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <Ionicons name="location-outline" size={16} color={colors.accent} />
          <Text style={styles.address} numberOfLines={1}>{item.origin?.address}</Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="flag-outline" size={16} color={colors.error} />
          <Text style={styles.address} numberOfLines={1}>{item.destination?.address}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>Ganancia neta</Text>
            <Text style={styles.footerValue}>{formatCOP(item.driverEarnings)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>Estado</Text>
            <Text style={[styles.footerValue, item.status === 'paid' ? styles.textSuccess : styles.textPending]}>
              {PAYMENT_STATUS_LABELS[item.paymentStatus] || item.status}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.dateFilters}>
          {DATE_FILTERS.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.filterBtn, dateFilter === f.id && styles.filterBtnActive]}
              onPress={() => setDateFilter(f.id)}
            >
              <Text style={[styles.filterText, dateFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
        
        <View style={styles.paymentFilters}>
          <Pressable onPress={() => setPaymentFilter(paymentFilter === 'cash' ? 'all' : 'cash')}>
            <Text style={[styles.paymentFilterText, paymentFilter === 'cash' && styles.paymentFilterActive]}>Efectivo</Text>
          </Pressable>
          <Pressable onPress={() => setPaymentFilter(paymentFilter === 'mercadopago' ? 'all' : 'mercadopago')}>
            <Text style={[styles.paymentFilterText, paymentFilter === 'mercadopago' && styles.paymentFilterActive]}>Mercado Pago</Text>
          </Pressable>
        </View>
      </View>

      {error ? (
        <Pressable onPress={onRefresh}>
          <Text style={styles.error}>{error} Toca para reintentar.</Text>
        </Pressable>
      ) : null}

      {loading && !error ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSoft} />
              <Text style={styles.emptyText}>No hay viajes en este período.</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ margin: spacing.md }} color={colors.primary} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  filtersContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateFilters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  filterBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.sm, color: colors.textSoft, fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  paymentFilters: { flexDirection: 'row', gap: spacing.md },
  paymentFilterText: { fontSize: fontSize.sm, color: colors.textSoft, fontWeight: '600' },
  paymentFilterActive: { color: colors.primary, textDecorationLine: 'underline' },
  listContent: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  date: { fontSize: fontSize.sm, color: colors.textSoft, fontWeight: '600' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  badgeCash: { backgroundColor: '#FEF3C7' },
  badgeCard: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.text },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  address: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: { fontSize: fontSize.sm, color: colors.textSoft, marginBottom: 2 },
  footerValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  textSuccess: { color: colors.accent },
  textPending: { color: '#F59E0B' },
  empty: { alignItems: 'center', marginTop: spacing.xl * 2 },
  emptyText: { marginTop: spacing.md, color: colors.textSoft, fontSize: fontSize.md },
  error: { color: colors.error, padding: spacing.md, textAlign: 'center' },
});