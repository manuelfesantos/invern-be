import { successResponse } from "@response-entity";
import { getOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async (context) => {
  const { params } = context;
  const { id } = params;
  const order = await getOrder(id);

  return successResponse.OK("Successfully got order", order);
};

export const onRequest = requestHandler({ GET });
