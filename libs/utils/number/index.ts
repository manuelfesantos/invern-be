const NUMBER_100 = 100;
const NUMBER_ZERO = 0;
const EIGHT_DIGITS = 8;
const ONE_HUNDRED_MILLION = 100_000_000;

export const percentageToRate = (percentage: number): number =>
  percentage / NUMBER_100;

export const isPositive = (number: number): boolean => number > NUMBER_ZERO;
export const isZero = (number: number): boolean => number === NUMBER_ZERO;

export const generateRandomEightDigitCode = (): string => {
  const randomNumber = Math.floor(Math.random() * ONE_HUNDRED_MILLION);
  return randomNumber.toString().padStart(EIGHT_DIGITS, "0");
};
