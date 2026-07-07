import { middlewareRequestHandler } from "@decorator-utils";
import { getCredentials } from "@jwt-utils";
import { errorResponse } from "@response-entity";
import { RolesEnum } from "@user-entity";
import { HttpMethodEnum } from "@http-entity";

const PRIVATE_SEGMENT = "/private/";

/**
 * Routes under `/private` that authenticate themselves or are machine-invoked;
 * the admin RBAC gate skips them:
 *   - `stock/setup` — validates its own body `secretKey`.
 *   - `expired/*` — maintenance (delete-expired carts/sessions/users). These
 *     are currently unauthenticated (pre-existing); no cron trigger, scheduled
 *     handler, or HTTP caller exists in the repo. Left out of the RBAC gate to
 *     preserve behaviour for any external scheduler; adding a service-token /
 *     scheduler auth is tracked in feature 06 (ops runbook).
 */
const SELF_GATED_PREFIXES = ["stock/setup", "expired/"];

/**
 * Authenticates the caller and requires `role === ADMIN` before any
 * `/private/*` handler runs. Single source of truth for admin authorization.
 *
 * - Anonymous / no valid tokens → `getCredentials` throws UNAUTHORIZED → 401.
 * - Authenticated non-admin (role !== ADMIN) → 403.
 * - `ADMIN` → passes through.
 *
 * Runs inside the global middleware's `contextStore.run` + `withLogger`, so
 * `ENV`/`logger()` are available. CORS preflight is answered by the global
 * middleware; the OPTIONS/HEAD guard here is defensive so the gate can never
 * reject a preflight.
 */
export const requireAdmin = middlewareRequestHandler(
  async ({ request, next }) => {
    if (
      request.method === HttpMethodEnum.OPTIONS ||
      request.method === HttpMethodEnum.HEAD
    ) {
      return next();
    }

    const { pathname } = new URL(request.url);
    const subPath = pathname.split(PRIVATE_SEGMENT)[1] ?? "";
    if (SELF_GATED_PREFIXES.some((prefix) => subPath.startsWith(prefix))) {
      return next();
    }

    const { role } = await getCredentials(request.headers);
    if (role !== RolesEnum.ADMIN) {
      return errorResponse.FORBIDDEN();
    }

    return next();
  },
);

export const onRequest = [requireAdmin];
