import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { Env } from "@request-entity";
import { stockClient } from "@r2-adapter";
import { z } from "zod";
import { getBodyFromRequest } from "@http-utils";

const bodySchema = z.object({
  secretKey: z.string(),
});

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const isAdminRequest =
    env.ENV !== "local" &&
    request.method === "POST" &&
    secretKeyIsValid(await getBodyFromRequest(request), env);
  const isLocalRequest = env.ENV === "local" && request.method === "GET";

  if (!isAdminRequest && !isLocalRequest) {
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

const secretKeyIsValid = (body: unknown, env: Env): boolean => {
  const { secretKey } = bodySchema.parse(body);
  return secretKey ? secretKey === env.SETUP_STOCK_SECRET : false;
};
