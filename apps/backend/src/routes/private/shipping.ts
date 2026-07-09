import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addShippingMethod,
  deleteShippingMethod,
  getShippingMethodById,
  getShippingMethodsPage,
  updateShippingMethod,
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

export default shipping;
