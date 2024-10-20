import { logger } from "@logger-utils";

export const buildResponse = (
  data: unknown,
  maybeInit?: Response | ResponseInit | undefined,
  headers?: Record<string, string>,
): Response => {
  logger().addData({ responseData: data });
  return Response.json(data, {
    ...maybeInit,
    headers,
  });
};
