import { successResponse } from "@response-entity";
import { getOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async (context) => {
  const { params, request } = context;
  const { id } = params;
  const email = request.headers.get("x-user-email");
  const order = await getOrder(id, email ?? undefined);

  return successResponse.OK("Successfully got order", { order });
};

export const onRequest = requestHandler({ GET });
