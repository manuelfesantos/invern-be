import { errorResponse, successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { z } from "zod";
/* eslint-disable import/no-restricted-paths */
import { stockClient } from "@r2-adapter";
import { getProducts } from "@product-db";
/* eslint-enable import/no-restricted-paths */
import { Env } from "@request-entity";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const bodySchema = z.object({
  secretKey: z.string(),
});

const NO_STOCK = 0;

const POST: PagesFunction<Env> = async ({ request, env }) => {
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

export const onRequest = requestHandler({ POST });
