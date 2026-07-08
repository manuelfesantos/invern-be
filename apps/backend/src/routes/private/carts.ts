import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getPaginationParams } from "@http-utils";
import { successResponse } from "@response-entity";
import { deleteCart, getAllCarts, getCart } from "@cart-module";

const carts = new Hono<HonoEnv>();

carts.get("/", async (c) =>
  successResponse.OK(
    "Carts fetched successfully",
    await getAllCarts(getPaginationParams(c.req.url)),
  ),
);

carts.get("/:id", async (c) => {
  const cart = await getCart(false, c.req.param("id"));
  return successResponse.OK("Cart fetched successfully", cart);
});

carts.delete("/:id", async (c) => {
  const cart = await deleteCart(c.req.param("id"));
  return successResponse.OK("Cart deleted successfully", cart);
});

export default carts;
