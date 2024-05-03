import { HttpResponseEnum } from "@http-entity";
import { buildResponse } from "./response";

export const successResponse = {
  OK: (message: string, data?: unknown): Response =>
    buildSuccessResponse(message, HttpResponseEnum.OK, data),
  CREATED: (message: string, data?: unknown): Response =>
    buildSuccessResponse(message, HttpResponseEnum.CREATED, data),
};

export const buildSuccessResponse = (
  message: string,
  status: number,
  data?: unknown,
): Response => {
  return buildResponse({ message, data }, { status });
};
