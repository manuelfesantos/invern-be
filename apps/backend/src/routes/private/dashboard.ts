import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { getDashboardSummary } from "@dashboard-module";

const dashboard = new Hono<HonoEnv>();

// Operational overview for the backoffice home (counts + low-stock + recent
// orders), computed in one D1 batch. Admin-gated by the /private middleware.
dashboard.get("/", async () =>
  successResponse.OK(
    "Dashboard summary fetched successfully",
    await getDashboardSummary(),
  ),
);

export default dashboard;
