import {
  getPrice,
  isPositive,
  isZero,
  percentageToRate,
  generateRandomEightDigitCode,
} from "@number-utils";

describe("number utils", () => {
  it("percentageToRate divides by 100", () => {
    expect(percentageToRate(23)).toBeCloseTo(0.23);
    expect(percentageToRate(0)).toBe(0);
    expect(percentageToRate(100)).toBe(1);
  });

  it("getPrice converts cents to a major-unit amount", () => {
    expect(getPrice(500)).toBe(5);
    expect(getPrice(199)).toBeCloseTo(1.99);
    expect(getPrice(0)).toBe(0);
  });

  it("isPositive / isZero", () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
    expect(isZero(0)).toBe(true);
    expect(isZero(1)).toBe(false);
  });

  it("generateRandomEightDigitCode returns an 8-digit string", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateRandomEightDigitCode();
      expect(code).toMatch(/^\d{8}$/);
    }
  });
});
