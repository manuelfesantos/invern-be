import { Hono } from "hono";
import type { HonoEnv } from "../../types/hono";
import { getBodyFromRequest, getPaginationParams } from "@http-utils";
import { successResponse } from "@response-entity";
import {
  addProduct,
  deleteProduct,
  getProductDetails,
  getProductsPage,
  updateProduct,
} from "@product-module";

const products = new Hono<HonoEnv>();

products.get("/", async (c) =>
  successResponse.OK(
    "Products fetched successfully",
    await getProductsPage(getPaginationParams(c.req.url)),
  ),
);

products.post("/", async (c) => {
  const { productId } = await addProduct(await getBodyFromRequest(c.req.raw));
  return successResponse.OK("Successfully created product", productId);
});

products.get("/:id", async (c) => {
  const product = await getProductDetails(c.req.param("id"), false);
  return successResponse.OK("Product fetched successfully", product);
});

products.put("/:id", async (c) => {
  const product = await updateProduct(
    c.req.param("id"),
    await getBodyFromRequest(c.req.raw),
  );
  return successResponse.OK("Product updated successfully", product);
});

products.delete("/:id", async (c) => {
  await deleteProduct(c.req.param("id"));
  return successResponse.OK("Product deleted successfully");
});

export default products;
