import { errorResponse, successResponse } from "@response-entity";
// eslint-disable-next-line import/no-restricted-paths
import { stockClient } from "@r2-adapter";
import { requestHandler } from "@decorator-utils";
import { ENV } from "@env-utils";

const GET: PagesFunction = async ({ params }) => {
  const isLocalRequest = ENV.ENV === "local";

  if (!isLocalRequest) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { productId } = params;
  if (!productId) {
    return errorResponse.BAD_REQUEST("productId is required");
  }
  const response = await stockClient.get(productId as string);
  if (!response) {
    return errorResponse.NOT_FOUND("product not found");
  }

  return successResponse.OK("success getting stock", response.data, {
    "Access-Control-Allow-Origin": ENV.FRONTEND_HOST,
  });
};

export const onRequest = requestHandler({ GET });
