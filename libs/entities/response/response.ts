import { getLogger } from "@logger-utils";

export const buildResponse = (
  response: unknown,
  maybeInit?: Response | ResponseInit | undefined,
): Response => {
  const logger = getLogger();
  logger.addData({ responseData: response });
  return Response.json(response, maybeInit);
};
