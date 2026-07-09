import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addTax,
  deleteTax,
  getTaxById,
  getTaxesPage,
  updateTax,
} from "@tax-module";

const taxes = new Hono<HonoEnv>();

// Paginated list; filter by `?countryCode=`.
taxes.get("/", async (c) =>
  successResponse.OK(
    "Taxes fetched successfully",
    await getTaxesPage(getListQueryParams(c.req.url)),
  ),
);

// Create a tax: creates the Stripe TaxRate and stores a D1 row keyed by its id.
taxes.post("/", async (c) => {
  const tax = await addTax(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Tax created successfully", tax);
});

taxes.get("/:id", async (c) => {
  const tax = await getTaxById(c.req.param("id"));
  return successResponse.OK("Tax fetched successfully", tax);
});

// Update name/description/active only; rate & country are immutable.
taxes.put("/:id", async (c) => {
  const tax = await updateTax(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Tax updated successfully", tax);
});

// Archive the Stripe rate and remove the D1 row.
taxes.delete("/:id", async (c) => {
  await deleteTax(c.req.param("id"));
  return successResponse.OK("Tax deleted successfully");
});

export default taxes;
