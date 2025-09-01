import { getProductDetails } from "@product-module";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";

export const onRequestGet = requestHandler(async ({ params }) => {
  const { id } = params;

  const productDetails = await getProductDetails(id, true);
  return successResponse.OK("Successfully got product", productDetails);
});
