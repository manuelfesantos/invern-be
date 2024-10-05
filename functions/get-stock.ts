import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { Env } from "@request-entity";
import { stockClient } from "@r2-adapter";

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET" || env.ENV !== "local") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const productId = new URL(request.url).searchParams.get("productId");
    if (!productId) {
      return errorResponse.BAD_REQUEST("productId is required");
    }
    const response = await stockClient.get(productId);
    if (!response) {
      return errorResponse.NOT_FOUND("product not found");
    }

    return successResponse.OK("success getting stock", response.data);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
