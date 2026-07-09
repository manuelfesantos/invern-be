/**
 * Weight-band validation for shipping rates. Bands are half-open [min, max) to
 * match checkout selection (minWeight <= weight < maxWeight), so adjacent bands
 * must NOT be treated as overlapping.
 */
import {
  assertNoBandOverlap,
  assertValidBand,
} from "../../libs/modules/shipping/use-cases/rate/admin/utils/band";

const band = (minWeight: number, maxWeight: number) => ({ minWeight, maxWeight });
const rate = (id: string, minWeight: number, maxWeight: number) => ({
  id,
  minWeight,
  maxWeight,
});

describe("assertValidBand", () => {
  it("accepts minWeight <= maxWeight", () => {
    expect(() => assertValidBand(band(0, 1000))).not.toThrow();
    expect(() => assertValidBand(band(1000, 1000))).not.toThrow();
  });
  it("rejects minWeight > maxWeight", () => {
    expect(() => assertValidBand(band(1000, 500))).toThrow();
  });
});

describe("assertNoBandOverlap", () => {
  const existing = [rate("a", 0, 1000), rate("b", 1000, 2000)];

  it("accepts a band that fills a gap / sits adjacent (half-open)", () => {
    // [1000,2000) is adjacent to [0,1000) — no overlap.
    expect(() => assertNoBandOverlap([rate("a", 0, 1000)], band(1000, 2000))).not.toThrow();
    // a gap band [2000,3000) beyond both existing bands.
    expect(() => assertNoBandOverlap(existing, band(2000, 3000))).not.toThrow();
  });

  it("rejects a band that overlaps an existing one", () => {
    expect(() => assertNoBandOverlap(existing, band(500, 1500))).toThrow();
  });

  it("rejects a band fully contained in an existing one", () => {
    expect(() => assertNoBandOverlap(existing, band(200, 800))).toThrow();
  });

  it("rejects a band that fully contains an existing one", () => {
    expect(() => assertNoBandOverlap(existing, band(0, 3000))).toThrow();
  });

  it("excludes the rate being updated from its own overlap check", () => {
    // Updating rate 'a' to [0,900) must not clash with itself.
    expect(() => assertNoBandOverlap(existing, band(0, 900), "a")).not.toThrow();
    // ...but still clashes with the OTHER rate 'b'.
    expect(() => assertNoBandOverlap(existing, band(0, 1500), "a")).toThrow();
  });

  it("accepts any band when the method has no existing rates", () => {
    expect(() => assertNoBandOverlap([], band(0, 1000))).not.toThrow();
  });
});
