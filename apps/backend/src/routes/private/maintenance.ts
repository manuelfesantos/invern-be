import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { deleteExpiredCarts } from "@cart-module";
import { deleteExpiredCheckoutSessions } from "@order-module";
import { deleteExpiredUsers } from "@user-module";

/**
 * Maintenance deletes, mounted at `/private/expired`. Self-gated (the admin RBAC
 * middleware bypasses the `expired/` prefix) — unauthenticated by pre-existing
 * design; adding scheduler/service-token auth is tracked separately.
 */
const maintenance = new Hono<HonoEnv>();

maintenance.delete("/carts", async () =>
  successResponse.OK(await deleteExpiredCarts()),
);

maintenance.delete("/sessions", async () =>
  successResponse.OK(await deleteExpiredCheckoutSessions()),
);

maintenance.delete("/users", async () =>
  successResponse.OK(await deleteExpiredUsers()),
);

export default maintenance;
