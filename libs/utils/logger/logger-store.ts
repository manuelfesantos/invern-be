import { AsyncLocalStorage } from "node:async_hooks";
import { Logger } from "./honeycomb-logger";
import { LoggerUseCase } from "@logger-entity";
import { buildLogObject } from "./build-log-object";
import { localLogger } from "./local-logger";
import { redactPropertiesFromData } from "./redact-properties-from-data";

const DEBUG_LEVEL = 20;
const INFO_LEVEL = 30;
const WARNING_LEVEL = 40;
const ERROR_LEVEL = 50;

let loggerLevel: number = DEBUG_LEVEL;

export const setLoggerLevel = (level: number): void => {
  loggerLevel = level;
};

interface LoggerStore extends Logger {
  info: (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ) => void;
  debug: (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ) => void;
  warn: (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ) => void;
  error: (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ) => void;
  addRedactedData: (...data: unknown[]) => void;
}

interface LoggerInstance extends LoggerStore {
  currentLog: number;
  incrementCurrentLog: () => void;
}

const buildLoggerInstance = (logger: Logger): LoggerInstance => {
  let currentLog = 1;

  const incrementCurrentLog = (): void => {
    currentLog++;
  };

  const info = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= INFO_LEVEL) {
      logger.addData(
        buildLogObject(currentLog, INFO_LEVEL, message, useCase, data),
      );
      localLogger.info(message, data);
      incrementCurrentLog();
    }
  };

  const debug = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= DEBUG_LEVEL) {
      logger.addData(
        buildLogObject(currentLog, DEBUG_LEVEL, message, useCase, data),
      );
      localLogger.debug(message, data);
      incrementCurrentLog();
    }
  };

  const warn = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= WARNING_LEVEL) {
      logger.addData(
        buildLogObject(currentLog, WARNING_LEVEL, message, useCase, data),
      );
      localLogger.warn(message, data);
      incrementCurrentLog();
    }
  };

  const error = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= ERROR_LEVEL) {
      logger.addData(
        buildLogObject(currentLog, ERROR_LEVEL, message, useCase, data),
      );
      localLogger.error(message, data);
      incrementCurrentLog();
    }
  };

  const addRedactedData = (...data: unknown[]): void => {
    logger.addData(...data.map((data) => redactPropertiesFromData(data)));
  };
  const loggerInstance = (): LoggerInstance => {
    logger.currentLog = currentLog;
    logger.incrementCurrentLog = incrementCurrentLog;
    logger.info = info;
    logger.debug = debug;
    logger.warn = warn;
    logger.error = error;
    logger.addRedactedData = addRedactedData;

    return logger;
  };
  return loggerInstance();
};

const loggerStore = new AsyncLocalStorage<LoggerInstance>();

export const logger = (): LoggerStore => {
  const logger = loggerStore.getStore();
  if (!logger) {
    throw new Error("logger store is not initialized");
  }

  return logger;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withLogger = (logger: Logger, fn: () => any): any =>
  loggerStore.run(buildLoggerInstance(logger), fn);
