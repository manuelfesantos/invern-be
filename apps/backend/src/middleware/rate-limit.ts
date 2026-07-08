import type { MiddlewareHandler } from "hono";
import { errorResponse } from "@response-entity";
import type { HonoEnv } from "../types/hono";

type LimiterBinding = "LOGIN_RATE_LIMITER" | "EMAIL_RATE_LIMITER";

/**
 * Throttles a credential endpoint per email using the Cloudflare Workers Rate
 * Limiting binding (config-only; per-Cloudflare-location, 60s window).
 *
 * The email is read from a *clone* of the request body so the downstream handler
 * can still parse the original. Non-enumerating: the 429 comes from the counter
 * alone and never touches the database, so it cannot reveal whether the email is
 * registered. Bodies without an email fall through — the handler's own schema
 * validation then produces the 400.
 */
export const rateLimitByEmail =
  (binding: LimiterBinding): MiddlewareHandler<HonoEnv> =>
  async (c, next) => {
    let email = "";
    try {
      const body = (await c.req.raw.clone().json()) as { email?: unknown };
      if (typeof body.email === "string") {
        email = body.email.trim().toLowerCase();
      }
    } catch {
      // No / invalid JSON body — defer to the handler's validation (→ 400).
    }

    if (email) {
      const { success } = await c.env[binding].limit({
        key: `${binding}:${email}`,
      });
      if (!success) {
        return errorResponse.TOO_MANY_REQUESTS();
      }
    }

    return next();
  };
