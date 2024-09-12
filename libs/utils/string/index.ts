const NUMBER_2 = 2;

export const stringifyObject = (value: unknown): string =>
  JSON.stringify(value, null, NUMBER_2);
