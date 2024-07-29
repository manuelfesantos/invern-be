import { HttpHeaderEnum, HttpMethodEnum } from "@http-entity";
import { deleteUser, getUser, getUserVersion, updateUser } from "@user-module";
import { errorResponse, generateErrorResponse } from "@response-entity";
import { setGlobalTimer } from "@timer-utils";
import { getBodyFromRequest } from "@http-utils";
import { getLogger } from "@logger-utils";

export const onRequest: PagesFunction = async (context): Promise<Response> => {
  setGlobalTimer();
  const { request, params } = context;
  const { headers } = request;
  const { id } = params;

  try {
    const body = await getBodyFromRequest(request);

    const logger = getLogger();
    logger.addData({ body });

    if (request.method === HttpMethodEnum.GET) {
      const getVersion = headers.get("getVersion");
      if (getVersion && getVersion === "true") {
        return await getUserVersion(id);
      }
      return await getUser(id);
    }
    if (request.method === HttpMethodEnum.DELETE) {
      return await deleteUser(id);
    }
    if (request.method === HttpMethodEnum.PUT) {
      const action = request.headers.get(HttpHeaderEnum.ACTION);
      return await updateUser(id, body, action);
    }

    return errorResponse.METHOD_NOT_ALLOWED();
  } catch (error: unknown) {
    return generateErrorResponse(error);
  }
};
