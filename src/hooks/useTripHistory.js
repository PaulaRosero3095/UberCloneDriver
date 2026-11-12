// src/hooks/useTripHistory.js
// AI-assisted: see docs/AI_LOG.md #12

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getHistoricalTrips } from '../services/tripService';

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfWeek = (d) => {
  const date = startOfDay(d);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // Monday
  return date;
};
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

export default function useTripHistory(driverId) {
  const [trips, setTrips] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [rangeFrom, setRangeFrom] = useState(null); // used when dateFilter === 'range'
  const [rangeTo, setRangeTo] = useState(null);

  const fetchTrips = useCallback(async (isRefresh = false) => {
    if (!driverId) return;
    if (isRefresh) setRefreshing(true);
    else if (!lastDoc) setLoading(true);
    else setLoadingMore(true);

    try {
      const { trips: newTrips, lastDoc: newLastDoc } = await getHistoricalTrips(
        driverId,
        isRefresh ? null : lastDoc
      );

      if (isRefresh) {
        setTrips(newTrips);
      } else {
        setTrips((prev) => [...prev, ...newTrips]);
      }
      // Keep the previous cursor when a page comes back empty
      if (newLastDoc) setLastDoc(newLastDoc);
      setHasMore(newTrips.length === 20);
      setError('');
    } catch (e) {
      console.warn('history failed:', e);
      setError('No pudimos cargar el historial.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [driverId, lastDoc]);

  useEffect(() => {
    fetchTrips(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const onRefresh = () => fetchTrips(true);
  const loadMore = () => {
    if (!loading && !loadingMore && hasMore && !error) fetchTrips(false);
  };

  const filteredTrips = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    return trips.filter((trip) => {
      const tripDate = toDate(trip.completedAt) || toDate(trip.createdAt);
      if (dateFilter === 'today' && (!tripDate || tripDate < todayStart)) return false;
      if (dateFilter === 'week' && (!tripDate || tripDate < weekStart)) return false;
      if (dateFilter === 'month' && (!tripDate || tripDate < monthStart)) return false;
      if (dateFilter === 'range') {
        if (!tripDate) return false;
        if (rangeFrom && tripDate < startOfDay(rangeFrom)) return false;
        if (rangeTo && tripDate >= new Date(startOfDay(rangeTo).getTime() + 24 * 60 * 60 * 1000)) return false;
      }
      if (paymentFilter !== 'all' && trip.paymentMethod !== paymentFilter) return false;
      if (!['completed', 'paid', 'cancelled'].includes(trip.status)) return false;

      return true;
    });
  }, [trips, dateFilter, paymentFilter, rangeFrom, rangeTo]);

  return {
    trips: filteredTrips,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    dateFilter,
    setDateFilter,
    paymentFilter,
    setPaymentFilter,
    rangeFrom,
    setRangeFrom,
    rangeTo,
    setRangeTo,
    onRefresh,
    loadMore,
  };
}