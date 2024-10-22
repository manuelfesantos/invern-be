const NUMBER_100 = 100;

export const percentageToRate = (percentage: number): number =>
  percentage / NUMBER_100;

export const rateToPercentage = (rate: number): number => rate * NUMBER_100;
