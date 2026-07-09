import { Hono } from "hono";
import { generateErrorResponse } from "@response-entity";
import type { HonoEnv } from "./types/hono";
import { cors } from "./middleware/cors";
import { bootstrap } from "./middleware/bootstrap";
import publicRoutes from "./routes/public";
import privateRoutes from "./routes/private";
import stripeRoutes from "./routes/stripe";
import health from "./routes/health";
import { scheduled } from "./scheduled";

const app = new Hono<HonoEnv>();

// Global chain (order matters): CORS (answers preflight, sets headers) wraps the
// per-request bootstrap (ENV + logger + context stores + error catch).
app.use("*", cors);
app.use("*", bootstrap);

app.route("/health", health);
app.route("/public", publicRoutes);
app.route("/private", privateRoutes);
app.route("/stripe", stripeRoutes);

// Hono routes every thrown error here. For downstream routes this runs nested
// inside bootstrap's store scope, so the shared handler sees the ALS logger and
// renders the sanitized `{ issues }` body. The fallback covers the rare error
// thrown outside that scope (e.g. in cors/bootstrap setup), where the logger
// isn't initialised.
app.onError((error) => {
  try {
    return generateErrorResponse(error);
  } catch {
    return Response.json(
      { issues: ["internal server error"] },
      { status: 500 },
    );
  }
});

export default { fetch: app.fetch, scheduled };
