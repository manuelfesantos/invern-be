import { getBodyFromRequest } from "@http-utils";
import { Env } from "@request-entity";
import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  if (request.method !== "POST") {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const body = await getBodyFromRequest(request);
    return successResponse.OK("success getting body", body);
  } catch (error) {
    return generateErrorResponse(error);
  }
};
