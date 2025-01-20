import { logger, redactPropertiesFromData } from "@logger-utils";

export const buildResponse = (
  data: unknown,
  maybeInit?: Response | ResponseInit | undefined,
  headers?: Record<string, string>,
): Response => {
  logger().addRedactedData({
    responseData: redactPropertiesFromData(data),
  });
  return Response.json(data, {
    ...maybeInit,
    headers,
  });
};
