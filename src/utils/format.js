// src/utils/format.js
// AI-assisted: see docs/AI_LOG.md #3
// Small pure helpers to format values for the screen and for the database.

const pad = (n) => String(n).padStart(2, '0');

// Date -> "2026-11-01" (what we store in Firestore)
export function toISODate(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Date -> "01/11/2026" (what the user sees)
export function formatDate(date) {
  if (!date) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// 0.2 -> "20 %"
export function formatPercent(rate) {
  return `${Math.round(rate * 100)} %`;
}
