import { HttpResponseEnum } from "@entities/http/http-response";
import { buildResponse } from "@entities/response/response";

export const successResponse = {
  OK: (message: string, data?: unknown) =>
    buildSuccessResponse(message, HttpResponseEnum.OK, data),
  CREATED: (message: string, data?: unknown) =>
    buildSuccessResponse(message, HttpResponseEnum.CREATED, data),
};

export const buildSuccessResponse = (
  message: string,
  status: number,
  data?: unknown,
) => {
  return buildResponse({ message, data }, { status });
};
