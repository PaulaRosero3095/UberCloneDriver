// src/hooks/useEarnings.js
// AI-assisted: see docs/AI_LOG.md #10
// Custom hook: real-time earnings for the driver, grouped by today / week / month.
// Concepts: useState, useEffect with cleanup (Firestore listener), useMemo (aggregates).

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '../config/firebase';
import { TRIP_STATUS } from '../config/trips';

// Only trips whose fare was already set count for earnings
const EARNINGS_STATUSES = [TRIP_STATUS.completed, TRIP_STATUS.paid];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Week starts on Monday (Colombia convention)
const startOfWeek = (d) => {
  const date = startOfDay(d);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - daysSinceMonday);
  return date;
};

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// Firestore Timestamp -> Date (defensive: accepts Date or null as well)
const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

// A trip counts on the date it was completed; fallback to createdAt
const tripDate = (trip) => toDate(trip.completedAt) || toDate(trip.createdAt);

// Pure aggregator for one list of trips
function summarize(trips) {
  const count = trips.length;
  const billed = trips.reduce((s, t) => s + (t.fare || 0), 0);
  const commissions = trips.reduce((s, t) => s + (t.commission || 0), 0);
  const tips = trips.reduce((s, t) => s + (t.tip || 0), 0);
  const net = trips.reduce((s, t) => s + (t.driverEarnings || 0), 0);
  const average = count > 0 ? Math.round(net / count) : 0;
  return { count, billed, commissions, tips, net, average };
}

export default function useEarnings({ driverId, balance = 0 }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real-time listener: cleanup on logout / unmount
  useEffect(() => {
    if (!driverId) {
      setTrips([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const q = query(
      collection(db, 'trips'),
      where('driverId', '==', driverId),
      where('status', 'in', EARNINGS_STATUSES)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTrips(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError('');
      },
      () => {
        setError('No pudimos cargar tus ganancias. Revisa tu conexión.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [driverId]);

  // All totals recalculated only when trips or balance change
  const summary = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const inPeriod = (start) =>
      trips.filter((t) => {
        const d = tripDate(t);
        return d && d >= start;
      });

    return {
      today: summarize(inPeriod(todayStart)),
      week: summarize(inPeriod(weekStart)),
      month: summarize(inPeriod(monthStart)),
      allTime: summarize(trips),
      balance,
    };
  }, [trips, balance]);

  return { summary, loading, error, totalTrips: trips.length };
}