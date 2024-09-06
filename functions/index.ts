import { PagesFunction } from "@cloudflare/workers-types";
import { errorResponse, prepareError, successResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();
  const { request } = context;
  if (request.method !== "GET") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  const { headers } = request;
  const value = headers.get("value");
  const key = headers.get("key");
  if (!key) {
    return successResponse.OK("Welcome to Invern Spirit!");
  }
  const getValue = headers.get("getValue");
  if (getValue && getValue === "true") {
    const secret = await getAuthSecret(key);
    return successResponse.OK("value", secret);
  }

  if (!value) {
    return errorResponse.BAD_REQUEST(prepareError("key is required"));
  }
  await setAuthSecret(key, value);

  return successResponse.OK(`Successfully put value ${value} in key ${key}`);
};
