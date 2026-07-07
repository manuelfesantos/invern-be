import type { Context } from "hono";
import type Env from "@env-entity";
import type { HonoEnv } from "../types/hono";

/**
 * Adapts a Pages-style handler to a Hono handler by shimming the small slice of
 * the Pages `EventContext` the handlers use (`request`, `params`, `waitUntil`).
 *
 * Used only for the checkout routes, which reuse `checkoutRequestHandler(...)`
 * so their bespoke error handling (graceful `isCheckoutPossible:false`
 * responses) and `currentCheckoutStage` preProcess are preserved exactly. Every
 * other route uses native Hono handlers.
 */
type PagesHandler = PagesFunction<Env>;
type PagesContext = Parameters<PagesHandler>[0];

export const adapt =
  (pagesHandler: PagesHandler) =>
  (c: Context<HonoEnv>): Response | Promise<Response> => {
    const waitUntil = (promise: Promise<unknown>): void => {
      try {
        c.executionCtx.waitUntil(promise);
      } catch {
        void promise;
      }
    };

    // A partial EventContext with only the fields the checkout handlers read.
    // The full Pages `EventContext` can't be satisfied by a Worker's request/env
    // (Pages-only `cf`/`ASSETS` types), so the shim is cast here — the handler
    // parameter stays precisely typed as `PagesFunction`, not `any`.
    return pagesHandler({
      request: c.req.raw,
      params: c.req.param(),
      env: c.env,
      data: {},
      waitUntil,
    } as unknown as PagesContext);
  };
