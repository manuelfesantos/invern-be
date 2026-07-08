import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addCountry,
  deleteCountry,
  getCountriesPage,
  getCountryByCountryCode,
  updateCountry,
} from "@country-module";
import { paginationParams } from "../../http/query";

const countries = new Hono<HonoEnv>();

countries.get("/", async (c) =>
  successResponse.OK(
    "Countries fetched successfully",
    await getCountriesPage(paginationParams(c)),
  ),
);

countries.post("/", async (c) => {
  const country = await addCountry(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Countries fetched successfully", country);
});

countries.get("/:code", async (c) => {
  const country = await getCountryByCountryCode(c.req.param("code"));
  return successResponse.OK("Countries fetched successfully", country);
});

countries.put("/:code", async (c) => {
  const country = await updateCountry(
    c.req.param("code"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Countries updated successfully", country);
});

countries.delete("/:code", async (c) => {
  const country = await deleteCountry(c.req.param("code"));
  return successResponse.OK("Countries deleted successfully", country);
});

export default countries;
