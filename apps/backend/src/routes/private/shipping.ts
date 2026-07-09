import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addShippingMethod,
  addShippingRate,
  deleteShippingMethod,
  deleteShippingRate,
  getRatesForMethod,
  getShippingMethodById,
  getShippingMethodsPage,
  getShippingRateById,
  setRateCountries,
  updateShippingMethod,
  updateShippingRate,
} from "@shipping-module";

const shipping = new Hono<HonoEnv>();

// -------------------------------- Methods --------------------------------- //

shipping.get("/methods", async (c) =>
  successResponse.OK(
    "Shipping methods fetched successfully",
    await getShippingMethodsPage(getListQueryParams(c.req.url)),
  ),
);

shipping.post("/methods", async (c) => {
  const method = await addShippingMethod(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Shipping method created successfully", method);
});

shipping.get("/methods/:id", async (c) => {
  const method = await getShippingMethodById(c.req.param("id"));
  return successResponse.OK("Shipping method fetched successfully", method);
});

shipping.put("/methods/:id", async (c) => {
  const method = await updateShippingMethod(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Shipping method updated successfully", method);
});

shipping.delete("/methods/:id", async (c) => {
  await deleteShippingMethod(c.req.param("id"));
  return successResponse.OK("Shipping method deleted successfully");
});

// -------- Rates (nested under a method; rate id is method-scoped) ---------- //

shipping.get("/methods/:methodId/rates", async (c) =>
  successResponse.OK(
    "Shipping rates fetched successfully",
    await getRatesForMethod(c.req.param("methodId")),
  ),
);

shipping.post("/methods/:methodId/rates", async (c) => {
  const rate = await addShippingRate(
    c.req.param("methodId"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Shipping rate created successfully", rate);
});

shipping.get("/methods/:methodId/rates/:rateId", async (c) => {
  const rate = await getShippingRateById(c.req.param("rateId"));
  return successResponse.OK("Shipping rate fetched successfully", rate);
});

shipping.put("/methods/:methodId/rates/:rateId", async (c) => {
  const rate = await updateShippingRate(
    c.req.param("methodId"),
    c.req.param("rateId"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Shipping rate updated successfully", rate);
});

shipping.delete("/methods/:methodId/rates/:rateId", async (c) => {
  await deleteShippingRate(c.req.param("rateId"));
  return successResponse.OK("Shipping rate deleted successfully");
});

// Replace the full set of countries a rate applies to.
shipping.put("/methods/:methodId/rates/:rateId/countries", async (c) => {
  const rate = await setRateCountries(
    c.req.param("rateId"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Shipping rate countries updated successfully", rate);
});

export default shipping;
