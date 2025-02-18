// eslint-disable-next-line import/no-restricted-paths
import { logger } from "@logger-utils";

export const buildResponse = (
  data: unknown,
  maybeInit?: Response | ResponseInit | undefined,
  headers?: Record<string, string>,
): Response => {
  logger().addRedactedData({
    "response.body": data,
  });
  return Response.json(data, {
    ...maybeInit,
    headers,
  });
};
