import { PRICING } from '../config/pricing';

export function calculateFare({
  distanceKm,
  durationMin,
  category = 'economy',
  tip = 0,
  commissionRate = PRICING.commissionRate, // each trip stores the rate it used
}) {
  const multiplier = PRICING.categoryMultiplier[category];
  if (multiplier === undefined) {
    throw new Error(`Unknown category: ${category}`);
  }

  // fare = max(minimum, (base + km * pricePerKm + min * pricePerMinute) * multiplier)
  const raw =
    (PRICING.baseFare +
      distanceKm * PRICING.pricePerKm +
      durationMin * PRICING.pricePerMinute) *
    multiplier;

  // Round to the nearest 100 COP BEFORE computing the commission
  const rounded = Math.round(raw / PRICING.roundTo) * PRICING.roundTo;
  const fare = Math.max(PRICING.minimumFare, rounded);

  const commission = Math.round(fare * commissionRate);
  const driverEarnings = fare - commission + tip; // the tip goes 100 % to the driver

  return { fare, commission, driverEarnings };
}