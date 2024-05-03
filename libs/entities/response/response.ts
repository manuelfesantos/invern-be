export const buildResponse = (
  response: unknown,
  maybeInit?: Response | ResponseInit | undefined,
): Response => {
  return Response.json(response, maybeInit);
};
