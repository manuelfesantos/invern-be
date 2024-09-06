import { getLogger } from "@logger-utils";

export const buildResponse = (
  data: unknown,
  maybeInit?: Response | ResponseInit | undefined,
  headers?: Record<string, string>,
): Response => {
  const logger = getLogger();
  logger.addData({ responseData: data });
  return Response.json(data, {
    ...maybeInit,
    headers: {
      ...headers,
      "Access-Control-Allow-Origin": "https://www-local.invernspirit.com",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "cf-access-client-id, cf-access-client-secret, action, authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
};
