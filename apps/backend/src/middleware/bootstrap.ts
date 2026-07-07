import type { MiddlewareHandler } from "hono";
import { setEnv } from "@env-utils";
import { contextStore } from "@context-utils";
import { withLogger } from "@logger-utils";
import { WorkerLogger } from "../logger";
import type { HonoEnv } from "../types/hono";

/**
 * Per-request bootstrap — the Hono equivalent of the Pages global middleware.
 *
 * Initialises the three process-global stores the whole codebase relies on
 * (the `ENV` proxy, the logger ALS, the request-context ALS) and runs the rest
 * of the chain *inside* them.
 *
 * Error handling is intentionally NOT done here: Hono's `compose` catches a
 * thrown error at the level of the throwing handler and routes it to
 * `app.onError`. Because every route is downstream of this middleware, that
 * `onError` call runs nested inside these `.run()` scopes — so the shared
 * error handler (`generateErrorResponse`) still sees the ALS logger.
 */
export const bootstrap: MiddlewareHandler<HonoEnv> = async (c, next) => {
  setEnv(c.env);
  const logger = new WorkerLogger();
  await contextStore.run(() => withLogger(logger as never, () => next()));
};
