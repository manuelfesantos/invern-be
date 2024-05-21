import { getLogger } from "@logger-utils";

export const buildResponse = (
  data: unknown,
  maybeInit?: Response | ResponseInit | undefined,
): Response => {
  const logger = getLogger();
  logger.addData({ responseData: data });
  return Response.json(data, {
    ...maybeInit,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
  });
};

export const redirectResponse = (url: string): Response => {
  const logger = getLogger();
  logger.addData({ responseUrl: url });
  return Response.redirect(url);
};
