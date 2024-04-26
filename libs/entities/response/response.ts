import { getTimePassed } from "@utils/time/timer";

export const buildResponse = (
  response: any,
  maybeInit?: Response | ResponseInit | undefined,
): Response => {
  console.log("Milliseconds passed:", getTimePassed());
  return Response.json(response, maybeInit);
};
