export const buildResponse = (
  response: any,
  maybeInit?: Response | ResponseInit | undefined,
): Response => {
  return Response.json(response, maybeInit);
};
