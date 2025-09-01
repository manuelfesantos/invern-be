import { successResponse } from "@response-entity";
import {
  deleteProduct,
  getProductDetails,
  updateProduct,
} from "@product-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async ({ params }) => {
  const productId = params.id as string;
  const product = await getProductDetails(productId, false);
  return successResponse.OK("Product fetched successfully", product);
});

export const onRequestPut = requestHandler(async ({ params, request }) => {
  const productId = params.id as string;
  const body = await getBodyFromRequest(request);
  const product = await updateProduct(productId, body);
  return successResponse.OK("Product updated successfully", product);
});

export const onRequestDelete = requestHandler(async ({ params }) => {
  const productId = params.id as string;
  await deleteProduct(productId);
  return successResponse.OK("Product deleted successfully");
});
