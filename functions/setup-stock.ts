import { getProducts } from "@product-db";
import { errorResponse, successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
import { stockClient } from "@r2-adapter";
import { Env } from "@request-entity";

const bodySchema = z.object({
  secretKey: z.string(),
});

const NO_STOCK = 0;

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const body = await getBodyFromRequest(request);
  const { secretKey } = bodySchema.parse(body);
  if (!secretKey || secretKey !== env.SETUP_STOCK_SECRET) {
    return errorResponse.UNAUTHORIZED();
  }

  const products = (await getProducts()).map(({ id, stock }) => ({
    id,
    stock: stock || NO_STOCK,
  }));

  const productUpdates = products.map((product) => stockClient.update(product));

  await Promise.all(productUpdates);

  return successResponse.OK("success setting up stock in bucket");
};
