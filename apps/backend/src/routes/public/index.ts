import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { getAllCountries } from "@country-module";
import country from "./country";

const publicRoutes = new Hono<HonoEnv>();

// Country list — no country context.
publicRoutes.get("/countries", async () =>
  successResponse.OK("success getting countries", await getAllCountries()),
);

// Everything scoped to a single country.
publicRoutes.route("/countries/:countryCode", country);

export default publicRoutes;
