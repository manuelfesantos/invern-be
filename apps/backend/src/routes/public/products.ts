import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { successResponse } from "@response-entity";
import { getQueryFromUrl } from "@http-utils";
import { getAllProducts, getProductDetails } from "@product-module";

const products = new Hono<HonoEnv>();

products.get("/", async (c) => {
  const search = getQueryFromUrl(c.req.url)?.get("search") ?? null;
  const result = await getAllProducts(search, true);
  return successResponse.OK("Successfully got products", result);
});

products.get("/:id", async (c) => {
  const product = await getProductDetails(c.req.param("id"), true);
  return successResponse.OK("Successfully got product", product);
});

export default products;
