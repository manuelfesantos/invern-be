const NUMBER_100 = 100;
const NUMBER_ZERO = 0;
const NINE_HUNDRED_THOUSAND = 900_000;
const ONE_HUNDRED_THOUSAND = 100_000;

export const percentageToRate = (percentage: number): number =>
  percentage / NUMBER_100;

export const rateToPercentage = (rate: number): number => rate * NUMBER_100;

export const isPositive = (number: number): boolean => number > NUMBER_ZERO;
export const isNegative = (number: number): boolean => number < NUMBER_ZERO;
export const isZero = (number: number): boolean => number === NUMBER_ZERO;
export const generateRandomSixDigitCode = (): string =>
  String(
    Math.floor(Math.random() * NINE_HUNDRED_THOUSAND) + ONE_HUNDRED_THOUSAND,
  );
