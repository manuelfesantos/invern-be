import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { Env } from "@request-entity";
import { stockClient } from "@r2-adapter";

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const productId = new URL(request.url).searchParams.get("productId");
    if (!productId) {
      return errorResponse.BAD_REQUEST("productId is required");
    }
    const stock = await stockClient.get(productId);
    if (!stock) {
      return errorResponse.NOT_FOUND("product not found");
    }

    return successResponse.OK("success getting stock", stock);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
