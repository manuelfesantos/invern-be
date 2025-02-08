import { LoggerUseCase } from "@logger-entity";
import { stringifyObject } from "@string-utils";

export const buildLogObject = (
  level: number,
  message: string,
  useCase: LoggerUseCase,
  data: Record<string, unknown> = {},
): string => {
  return stringifyObject({
    level,
    message,
    useCase,
    ...data,
    timeStamp: new Date().toISOString(),
  });
};
