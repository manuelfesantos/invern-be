import {
  deleteUser,
  getUser,
  updateUser,
  userActionMapper,
} from "@user-module";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { getCredentials } from "@jwt-utils";
import { logger } from "@logger-utils";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  const { request } = context;

  const { headers } = request;

  try {
    const { userId, refreshToken, accessToken, remember } =
      await getCredentials(headers);

    const tokens = { refreshToken, accessToken };

    if (request.method === HttpMethodEnum.GET) {
      return await getUser(tokens, remember, userId);
    }

    if (request.method === HttpMethodEnum.DELETE) {
      return await deleteUser(tokens, remember, userId);
    }

    const body = await getBodyFromRequest(request);
    const action = request.headers.get(HttpHeaderEnum.ACTION);

    logger().addData({ body });

    if (request.method === HttpMethodEnum.POST) {
      return await userActionMapper(body, action, userId);
    }

    if (request.method === HttpMethodEnum.PUT) {
      return await updateUser(tokens, remember, body, action, userId);
    }

    return errorResponse.METHOD_NOT_ALLOWED();
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
