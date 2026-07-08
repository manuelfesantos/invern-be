import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  cancelOrder,
  getAllOrders,
  getOrder,
  updateOrder,
} from "@order-module";
import { paginationParams } from "../../http/query";

const orders = new Hono<HonoEnv>();

// Optional single filter (userId | paymentId | shippingTransactionId | stripeId).
const ORDER_FILTERS = [
  "userId",
  "paymentId",
  "shippingTransactionId",
  "stripeId",
] as const;

orders.get("/", async (c) => {
  const params = new URL(c.req.url).searchParams;
  const filter = ORDER_FILTERS.map(
    (key) => [key, params.get(key)] as const,
  ).find(([, value]) => value);

  const pagination = paginationParams(c);
  const result = filter
    ? await getAllOrders(filter[0], filter[1] as string, pagination)
    : await getAllOrders(undefined, undefined, pagination);

  return successResponse.OK("Orders fetched successfully", result);
});

orders.get("/:id", async (c) => {
  const order = await getOrder(c.req.param("id"), false);
  return successResponse.OK("Order fetched successfully", order);
});

orders.put("/:id", async (c) => {
  const order = await updateOrder(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Order cancelled successfully", order);
});

orders.put("/:id/cancel", async (c) => {
  const order = await cancelOrder(c.req.param("id"));
  return successResponse.OK("Order cancelled successfully", order);
});

export default orders;
