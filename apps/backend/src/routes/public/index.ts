import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { getAllCountries } from "@country-module";
import country from "./country";
import images from "./images";

const publicRoutes = new Hono<HonoEnv>();

// Country list — no country context.
publicRoutes.get("/countries", async () =>
  successResponse.OK("success getting countries", await getAllCountries()),
);

// Serves uploaded image objects from R2 (not country-scoped).
publicRoutes.route("/images", images);

// Everything scoped to a single country.
publicRoutes.route("/countries/:countryCode", country);

export default publicRoutes;
