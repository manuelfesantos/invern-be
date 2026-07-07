import type { MiddlewareHandler } from "hono";
import { getCredentials } from "@jwt-utils";
import { errorResponse } from "@response-entity";
import { RolesEnum } from "@user-entity";
import { HttpMethodEnum } from "@http-entity";
import type { HonoEnv } from "../types/hono";

const PRIVATE_SEGMENT = "/private/";

/**
 * Routes under `/private` that authenticate themselves or are machine-invoked,
 * so the admin RBAC gate skips them (faithful port of the Pages middleware):
 *   - `stock/setup` — validates its own `secretKey` body.
 *   - `expired/*`   — maintenance (unauthenticated by pre-existing design).
 */
const SELF_GATED_PREFIXES = ["stock/setup", "expired/"];

/**
 * Requires `role === ADMIN` before any gated `/private/*` handler runs.
 * Anonymous / invalid tokens → `getCredentials` throws UNAUTHORIZED (401);
 * authenticated non-admins → 403; admins pass through.
 */
export const requireAdmin: MiddlewareHandler<HonoEnv> = async (c, next) => {
  if (
    c.req.method === HttpMethodEnum.OPTIONS ||
    c.req.method === HttpMethodEnum.HEAD
  ) {
    return next();
  }

  const { pathname } = new URL(c.req.url);
  const subPath = pathname.split(PRIVATE_SEGMENT)[1] ?? "";
  if (SELF_GATED_PREFIXES.some((prefix) => subPath.startsWith(prefix))) {
    return next();
  }

  const { role } = await getCredentials(c.req.raw.headers);
  if (role !== RolesEnum.ADMIN) {
    return errorResponse.FORBIDDEN();
  }

  return next();
};
