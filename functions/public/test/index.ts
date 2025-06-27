import { requestHandler } from "@decorator-utils";
/* eslint-disable import/no-restricted-paths */
import { stockClient } from "@r2-adapter";
import { logger } from "@logger-utils";
import { getAuthSecret } from "@kv-adapter";
import { successResponse } from "@response-entity";
import { getSelectProductStockByIdAction } from "@product-db";
/* eslint-enable import/no-restricted-paths */

const GET: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const userId = url.searchParams.get("userId");
  const stockTime = performance.now();
  await stockClient.get(productId || "");
  const stockDuration = performance.now() - stockTime;
  const authTime = performance.now();
  await getAuthSecret(userId || "");
  const authDuration = performance.now() - authTime;
  const publicStockTime = performance.now();
  await fetch(`https://stock-preview.invernspirit.com/${productId || ""}`);
  const publicStockDuration = performance.now() - publicStockTime;
  const dbTime = performance.now();
  await getSelectProductStockByIdAction(productId || "").run();
  const dbDuration = performance.now() - dbTime;
  logger().info("Stock GET request completed", {
    useCase: "TEST_FETCH_DURATION",
    data: {
      stockDuration,
      dbDuration,
      authDuration,
      publicStockDuration,
    },
  });
  return successResponse.OK("Successfully tested both times", {
    stockDuration,
    authDuration,
    publicStockDuration,
    dbDuration,
  });
};

export const onRequest = requestHandler({ GET });
