const NUMBER_100 = 100;
const NUMBER_ZERO = 0;

export const percentageToRate = (percentage: number): number =>
  percentage / NUMBER_100;

export const rateToPercentage = (rate: number): number => rate * NUMBER_100;

export const isPositive = (number: number): boolean => number > NUMBER_ZERO;
export const isNegative = (number: number): boolean => number < NUMBER_ZERO;
export const isZero = (number: number): boolean => number === NUMBER_ZERO;
