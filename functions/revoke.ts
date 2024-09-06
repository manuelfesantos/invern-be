import {
  errorResponse,
  generateErrorResponse,
  successResponse,
} from "@response-entity";

import { HttpMethodEnum } from "@http-entity";
import { Env } from "@request-entity";
import { getBodyFromRequest } from "@http-utils";
import { deleteAuthSecret } from "@kv-adapter";

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
      !("id" in body) ||
      typeof body.id !== "string"
    ) {
      return errorResponse.BAD_REQUEST();
    }

    const { id } = body;
    await deleteAuthSecret(id);
    return successResponse.OK("success revoking secret", { id });
  } catch (error) {
    return generateErrorResponse(error);
  }
};
