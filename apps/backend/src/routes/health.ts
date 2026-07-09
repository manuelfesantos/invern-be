import { Hono } from "hono";
import type { HonoEnv } from "../types/hono";
import { getHealthStatus } from "@health-module";

const health = new Hono<HonoEnv>();

// Public readiness probe for uptime monitoring: pings D1/KV/R2 and returns 200
// when all are reachable, 503 when any dependency is down. No auth.
health.get("/", async (c) => {
  const result = await getHealthStatus();
  return c.json(result, result.status === "ok" ? 200 : 503);
});

export default health;
