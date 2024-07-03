import {
  errorResponse,
  generateErrorResponse,
  prepareError,
} from "@response-entity";
import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { updateCart } from "@cart-module";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();

  const { request, params } = context;
  const { id } = params;

  if (request.method !== HttpMethodEnum.PUT) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }

  const { headers } = request;
  const action = headers.get(HttpHeaderEnum.ACTION);

  if (!action) {
    return errorResponse.BAD_REQUEST(prepareError("action is required"));
  }

  try {
    const body = await getBodyFromRequest(request);

    const logger = getLogger();
    logger.addData({ body });

    return await updateCart(body, action, id);
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
