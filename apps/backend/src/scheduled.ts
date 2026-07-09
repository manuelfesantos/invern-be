import { setEnv } from "@env-utils";
import { contextStore } from "@context-utils";
import { logger, withLogger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { deleteExpiredCarts } from "@cart-module";
import { deleteExpiredCheckoutSessions } from "@order-module";
import { deleteExpiredUsers } from "@user-module";
import { WorkerLogger } from "./logger";

const TASKS: { name: string; run: () => Promise<string> }[] = [
  { name: "expired-carts", run: deleteExpiredCarts },
  { name: "expired-sessions", run: deleteExpiredCheckoutSessions },
  { name: "expired-users", run: deleteExpiredUsers },
];

/**
 * Runs each maintenance task in isolation — a failure in one is logged and does
 * not block the others (a cron run should make as much progress as it can).
 */
const runMaintenance = async (): Promise<void> => {
  for (const task of TASKS) {
    try {
      const result = await task.run();
      logger().info(`scheduled maintenance: ${task.name}`, {
        useCase: LoggerUseCaseEnum.CHECK_EXPIRED_SESSIONS,
        data: { task: task.name, result },
      });
    } catch (error) {
      logger().error(`scheduled maintenance failed: ${task.name}`, {
        useCase: LoggerUseCaseEnum.CHECK_EXPIRED_SESSIONS,
        data: {
          task: task.name,
          message: error instanceof Error ? error.message : "unknown error",
        },
      });
    }
  }
};

/**
 * Cron entrypoint (see `triggers.crons` in wrangler.jsonc) that sweeps expired
 * carts, checkout sessions, and unvalidated users. Sets up the same ENV/logger/
 * context stores the fetch bootstrap does, since there is no request here. This
 * replaces relying on an external caller hitting the unauthenticated
 * `/private/expired/*` routes.
 */
export const scheduled: ExportedHandlerScheduledHandler = async (_event, env) => {
  setEnv(env as never);
  const workerLogger = new WorkerLogger();
  await contextStore.run(() =>
    withLogger(workerLogger as never, () => runMaintenance()),
  );
};
