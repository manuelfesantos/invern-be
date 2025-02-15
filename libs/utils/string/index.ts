const NUMBER_2 = 2;

export const stringifyObject = (value: unknown, space?: number): string =>
  JSON.stringify(value, null, space ?? NUMBER_2);
