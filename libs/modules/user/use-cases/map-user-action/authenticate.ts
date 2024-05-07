import { successResponse } from "@response-entity";
import { getSecretKey } from "@secret-key-adapter";

export const authenticate = async (body: unknown): Promise<Response> => {
  const secretKey = await getSecretKey("something");
  JSON.stringify(body);
  return successResponse.OK(secretKey);
};
