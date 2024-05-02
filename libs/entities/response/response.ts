import { getGlobalPassedTime } from "@timer-utils";

export const buildResponse = (
  response: any,
  maybeInit?: Response | ResponseInit | undefined,
): Response => {
  console.log("Time passed:", getGlobalPassedTime());
  return Response.json(response, maybeInit);
};
