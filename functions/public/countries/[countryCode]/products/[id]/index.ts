import { getProductDetails } from "@product-module";
import { requestHandler } from "@decorator-utils";
import { successResponse } from "@response-entity";

const GET: PagesFunction = async ({ params }) => {
  const { id } = params;

  const productDetails = await getProductDetails(id, true);
  return successResponse.OK("Successfully got product", productDetails);
};

export const onRequest = requestHandler({ GET });
