import { AsyncLocalStorage } from "node:async_hooks";
import { Logger } from "./honeycomb-logger";
import { LoggerUseCase } from "@logger-entity";
import { buildLogObject } from "./build-log-object";
import { localLogger } from "./local-logger";
import { redactPropertiesFromData } from "./redact-properties-from-data";
import { stringifyObject } from "@string-utils";

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
  const addRedactedData = (...data: unknown[]): void => {
    const redactedData = data.map((data) => redactPropertiesFromData(data));
    logger.addData(...redactedData);
  };

  const addRedactedLog = (data: string): void => {
    const redactedData = redactPropertiesFromData(JSON.parse(data));
    logger.log(stringifyObject(redactedData));
  };

  const info = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= INFO_LEVEL) {
      addRedactedLog(buildLogObject(INFO_LEVEL, message, useCase, data));
      localLogger.info(message, data);
    }
  };

  const debug = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= DEBUG_LEVEL) {
      addRedactedLog(buildLogObject(DEBUG_LEVEL, message, useCase, data));
      localLogger.debug(message, data);
    }
  };

  const warn = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= WARNING_LEVEL) {
      addRedactedLog(buildLogObject(WARNING_LEVEL, message, useCase, data));
      localLogger.warn(message, data);
    }
  };

  const error = (
    message: string,
    useCase: LoggerUseCase,
    data?: Record<string, unknown>,
  ): void => {
    if (loggerLevel <= ERROR_LEVEL) {
      addRedactedLog(buildLogObject(ERROR_LEVEL, message, useCase, data));
      localLogger.error(message, data);
    }
  };
  const loggerInstance = (): LoggerInstance => {
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

export const withLogger = <T>(logger: Logger, fn: () => T): T =>
  loggerStore.run(buildLoggerInstance(logger), fn);
