import { errors } from "@error-handling-utils";

interface Band {
  minWeight: number;
  maxWeight: number;
}
interface RateBand extends Band {
  id: string;
}

/**
 * Bands are half-open `[minWeight, maxWeight)` — matching how checkout selects a
 * rate (`minWeight <= weight < maxWeight`). Two bands overlap when each starts
 * before the other ends.
 */
const overlaps = (a: Band, b: Band): boolean =>
  a.minWeight < b.maxWeight && b.minWeight < a.maxWeight;

export const assertValidBand = (band: Band): void => {
  if (band.minWeight > band.maxWeight) {
    throw errors.SHIPPING_RATE_INVALID_BAND();
  }
};

/**
 * Rejects a band that overlaps any of the method's existing rates. `excludeId`
 * skips the rate being updated (so it doesn't clash with itself).
 */
export const assertNoBandOverlap = (
  existing: RateBand[],
  band: Band,
  excludeId?: string,
): void => {
  const clash = existing.some(
    (rate) => rate.id !== excludeId && overlaps(rate, band),
  );
  if (clash) {
    throw errors.SHIPPING_RATE_BAND_OVERLAP();
  }
};
