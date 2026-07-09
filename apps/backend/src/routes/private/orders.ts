import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getListQueryParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  cancelOrder,
  getAllOrders,
  getOrder,
  updateFulfillment,
  updateOrder,
} from "@order-module";

const orders = new Hono<HonoEnv>();

orders.get("/", async (c) =>
  successResponse.OK(
    "Orders fetched successfully",
    await getAllOrders(getListQueryParams(c.req.url)),
  ),
);

orders.get("/:id", async (c) => {
  const order = await getOrder(c.req.param("id"), false);
  return successResponse.OK("Order fetched successfully", order);
});

orders.put("/:id", async (c) => {
  const order = await updateOrder(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Order updated successfully", order);
});

orders.put("/:id/cancel", async (c) => {
  const order = await cancelOrder(c.req.param("id"));
  return successResponse.OK("Order cancelled successfully", order);
});

orders.put("/:id/fulfillment", async (c) => {
  const order = await updateFulfillment(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Order fulfillment updated successfully", order);
});

export default orders;
