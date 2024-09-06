import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";
import { HttpMethodEnum } from "@http-entity";
import { base64Decode } from "@crypto-utils";
import { Env } from "@request-entity";
import { getBodyFromRequest } from "@http-utils";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request } = context;
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const body = await getBodyFromRequest(request);
    if (
      !body ||
      typeof body !== "object" ||
      !("text" in body) ||
      typeof body.text !== "string"
    ) {
      return errorResponse.BAD_REQUEST();
    }
    return successResponse.OK("success", {
      decodedText: base64Decode(body.text),
    });
  } catch (error) {
    return generateErrorResponse(error);
  }
};
