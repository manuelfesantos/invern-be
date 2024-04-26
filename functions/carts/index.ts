import { z } from "zod";
import { HttpMethodEnum } from "@entities/http/http-request";
import {
  errorResponse,
  generateErrorResponse,
} from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";
import { startTimer } from "@utils/time/timer";

interface Env {
  INVERN_DB: D1Database;
}

const bodySchema = z.object({});
export const onRequest: PagesFunction<Env> = async (context) => {
  startTimer();
  const { request, env } = context;
  if (request.method !== HttpMethodEnum.POST) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  try {
    const body = bodySchema.parse(await request.json());
    return successResponse.OK("success getting carts", body);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
