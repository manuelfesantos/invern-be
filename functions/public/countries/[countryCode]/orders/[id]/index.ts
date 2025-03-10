import { successResponse } from "@response-entity";
import { getOrder } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { setCustomerEmailCookieInResponse } from "@http-utils";
import { encrypt } from "@crypto-utils";

const GET: PagesFunction = async (context) => {
  const { params, request } = context;
  const { id } = params;
  const email = request.headers.get("x-user-email");
  const order = await getOrder(id, email ?? undefined);

  const response = successResponse.OK("Successfully got order", { order });

  if (email) {
    setCustomerEmailCookieInResponse(response, await encrypt(email));
  }

  return response;
};

export const onRequest = requestHandler({ GET });
