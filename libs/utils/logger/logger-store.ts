import { AsyncLocalStorage } from "node:async_hooks";
import { Logger } from "./honeycomb-logger";

const loggerStore = new AsyncLocalStorage<Logger>();

export const getLogger = (): Logger => loggerStore.getStore();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withLogger = (logger: Logger, fn: () => any): any =>
  loggerStore.run(logger, fn);
