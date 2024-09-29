import { LoggerUseCase } from "@logger-entity";

export const buildLogObject = (
  currentLog: number,
  level: number,
  message: string,
  useCase: LoggerUseCase,
  data: Record<string, unknown> = {},
): Record<string, unknown> => {
  return {
    [`${currentLog}-level`]: level,
    [`${currentLog}-message`]: message,
    [`${currentLog}-use-case`]: useCase,
    [`${currentLog}-data`]: data,
  };
};
