import uuid from "short-uuid";

export const getRandomUUID = (): string => uuid.generate();

export const isValidUUID = (value: string): boolean =>
  uuid().validate(value, true);
