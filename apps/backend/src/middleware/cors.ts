import type { MiddlewareHandler } from "hono";
import { HttpMethodEnum } from "@http-entity";
import {
  applyCorsHeaders,
  corsPreflightResponse,
  getAllowedOrigins,
} from "@http-utils";
import type { HonoEnv } from "../types/hono";

/**
 * Allow-list CORS, reusing the shared helpers so behaviour matches the Pages
 * app exactly (credentials on, origin echoed from FRONTEND_HOST/BACKOFFICE_HOST,
 * never `*`). Reads `c.env` directly, so it works as the outermost middleware —
 * before `bootstrap` runs `setEnv`.
 */
export const cors: MiddlewareHandler<HonoEnv> = async (c, next) => {
  const origins = getAllowedOrigins(c.env);

  if (c.req.method === HttpMethodEnum.OPTIONS) {
    return corsPreflightResponse(c.req.raw, origins);
  }

  await next();

  applyCorsHeaders(c.req.raw, c.res, origins);
};
