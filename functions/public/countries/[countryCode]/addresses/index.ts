import { protectedSuccessResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { createAddress } from "@address-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);

  const address = await createAddress(body);

  return protectedSuccessResponse.OK("Successfully created address", address);
};

export const onRequest = requestHandler({ POST });
