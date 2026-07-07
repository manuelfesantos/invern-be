import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getQueryFromUrl } from "@http-utils";
import { successResponse } from "@response-entity";
import { deleteCart, getAllCarts, getCart } from "@cart-module";

const carts = new Hono<HonoEnv>();

carts.get("/", async (c) => {
  const query = getQueryFromUrl(c.req.url);
  const { count, carts } = await getAllCarts(
    query?.get("page"),
    query?.get("pageSize"),
  );
  return successResponse.OK("Carts fetched successfully", { count, carts });
});

carts.get("/:id", async (c) => {
  const cart = await getCart(false, c.req.param("id"));
  return successResponse.OK("Cart fetched successfully", cart);
});

carts.delete("/:id", async (c) => {
  const cart = await deleteCart(c.req.param("id"));
  return successResponse.OK("Cart deleted successfully", cart);
});

export default carts;
