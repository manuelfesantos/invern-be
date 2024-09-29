import { PagesFunction } from "@cloudflare/workers-types";
import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { Env } from "@request-entity";
import { z } from "zod";
import { positiveIntegerSchema, uuidSchema } from "@global-entity";
import { getBodyFromRequest } from "@http-utils";

const stockSchema = z.object({
  productId: uuidSchema("productId"),
  stock: positiveIntegerSchema("stock"),
});

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const stockBucket = env.STOCK_BUCKET;

    const body = await getBodyFromRequest(request);
    const { productId, stock } = stockSchema.parse(body);

    await stockBucket.put(productId, String(stock));
    return successResponse.OK(
      `success adding stock ${stock} to product ${productId}`,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
