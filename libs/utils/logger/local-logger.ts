import { isLocalEnv } from "@http-utils";

/*eslint-disable no-console*/
export const localLogger = {
  debug(...args: unknown[]): void {
    if (isLocalEnv()) {
      console.debug(args);
    }
  },
  error(...args: unknown[]): void {
    if (isLocalEnv()) {
      console.error(args);
    }
  },
  warn(...args: unknown[]): void {
    if (isLocalEnv()) {
      console.warn(args);
    }
  },
  info(...args: unknown[]): void {
    if (isLocalEnv()) {
      console.log(args);
    }
  },
};

/*eslint-enable no-console*/
