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
const NO_SPACE = 0;

let loggerLevel: number = DEBUG_LEVEL;

export const setLoggerLevel = (level: number): void => {
  loggerLevel = level;
};

type LoggerAction = (
  message: string,
  additionalInfo: {
    useCase: LoggerUseCase;
    data?: object;
  },
) => void;

interface LoggerStore extends Logger {
  info: LoggerAction;
  debug: LoggerAction;
  warn: LoggerAction;
  error: LoggerAction;
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
    logger.log(stringifyObject(redactedData, NO_SPACE));
  };

  const info: LoggerAction = (message, { useCase, data }): void => {
    if (loggerLevel <= INFO_LEVEL) {
      addRedactedLog(buildLogObject(INFO_LEVEL, message, useCase, data));
      localLogger.info(message, data);
    }
  };

  const debug: LoggerAction = (message, { useCase, data }): void => {
    if (loggerLevel <= DEBUG_LEVEL) {
      addRedactedLog(buildLogObject(DEBUG_LEVEL, message, useCase, data));
      localLogger.debug(message, data);
    }
  };

  const warn: LoggerAction = (message, { useCase, data }): void => {
    if (loggerLevel <= WARNING_LEVEL) {
      addRedactedLog(buildLogObject(WARNING_LEVEL, message, useCase, data));
      localLogger.warn(message, data);
    }
  };

  const error: LoggerAction = (message, { useCase, data }): void => {
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
