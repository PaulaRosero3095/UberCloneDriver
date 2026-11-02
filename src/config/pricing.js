// src/config/pricing.js
// AI-assisted: see docs/AI_LOG.md #1
// Single place for every pricing value (didactic values, not real fares).
// All money is handled in whole Colombian pesos (COP) to avoid decimal errors.

export const PRICING = {
  baseFare: 3500, // COP
  pricePerKm: 1200, // COP
  pricePerMinute: 250, // COP
  minimumFare: 6000, // COP
  commissionRate: 0.2, // 20 % platform commission
  roundTo: 100, // fares are rounded to the nearest 100 COP
  categoryMultiplier: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
};
