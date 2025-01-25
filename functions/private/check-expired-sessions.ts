import { checkExpiredCheckoutSessions } from "@order-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { successResponse } from "@response-entity";

const POST: PagesFunction = async () => {
  const responseMessage = await checkExpiredCheckoutSessions();
  return successResponse.OK(responseMessage);
};

export const onRequest = requestHandler({ POST });
