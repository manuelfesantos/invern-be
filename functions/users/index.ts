import { userActionMapper } from "@user-module";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();

  const { request } = context;

  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  try {
    const body = await getBodyFromRequest(request);

    const logger = getLogger();
    logger.addData({ body });

    const action = request.headers.get(HttpHeaderEnum.ACTION);

    return await userActionMapper(body, action);
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
