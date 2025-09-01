import { addProduct, getAllProducts } from "@product-module";
import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async () => {
  const products = await getAllProducts(null, false);
  return successResponse.OK("Products fetched successfully", products);
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const { productId } = await addProduct(body);
  return successResponse.OK("Successfully created product", productId);
});
