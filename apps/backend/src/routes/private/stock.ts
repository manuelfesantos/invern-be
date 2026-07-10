import { Hono } from "hono";
import * as z from "zod";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest } from "@http-utils";
import { errorResponse, successResponse } from "@response-entity";
import { ENV } from "@env-utils";
import { stockClient } from "@r2-adapter";
import { getSelectProductsAction } from "@product-db";
import { setProductStock } from "@product-module";

const stock = new Hono<HonoEnv>();

const setupBodySchema = z.object({ secretKey: z.string() });
const setStockBodySchema = z.object({
  stock: z.number().int().nonnegative(),
});
const NO_STOCK = 0;

// Self-gated by SETUP_STOCK_SECRET (the admin RBAC middleware bypasses this path).
stock.post("/setup", async (c) => {
  const { secretKey } = setupBodySchema.parse(
    await getBodyFromRequest(c.req.raw),
  );
  if (!secretKey || secretKey !== ENV.SETUP_STOCK_SECRET) {
    return errorResponse.UNAUTHORIZED();
  }

  const products = (await getSelectProductsAction().run()).map(
    ({ id, stock }) => ({ id, stock: stock || NO_STOCK }),
  );
  await stockClient.updateMany(products);

  return successResponse.OK("success setting up stock in bucket");
});

// Admin-only; only served locally (ENV=local).
stock.get("/:productId", async (c) => {
  if (ENV.ENV !== "local") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const productId = c.req.param("productId");
  if (!productId) {
    return errorResponse.BAD_REQUEST("productId is required");
  }

  const response = await stockClient.getFromBucket(productId);
  if (!response) {
    return errorResponse.NOT_FOUND("product not found");
  }

  return successResponse.OK("success getting stock", response);
});

// Admin-only (RBAC applies — not in the self-gated bypass list). Sets a
// product's absolute stock through the write-through path (D1 + KV + R2).
stock.put("/:productId", async (c) => {
  const productId = c.req.param("productId");
  if (!productId) {
    return errorResponse.BAD_REQUEST("productId is required");
  }
  const { stock: newStock } = setStockBodySchema.parse(
    await getBodyFromRequest(c.req.raw),
  );
  const result = await setProductStock(productId, newStock);
  return successResponse.OK("Stock updated successfully", result);
});

export default stock;
