import { errorResponse, generateErrorResponse } from "@response-entity";
import { HttpMethodEnum, httpMethodsSchema } from "@http-entity";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

type Data = Record<string, unknown>;

function tryCatchWrapper<T extends Data>(
  fn: PagesFunction<Env, string, T>,
): PagesFunction<Env, string, T> {
  return async (context): Promise<Response> => {
    try {
      return await fn(context);
    } catch (error) {
      return generateErrorResponse(error);
    }
  };
}

export function middlewareRequestHandler<T extends Data>(
  fn: PagesFunction<Env, string, T>,
): PagesFunction<Env, string, T> {
  return tryCatchWrapper(fn);
}

export function requestHandler<T extends Data>(
  methodMapper: Partial<
    Record<keyof typeof HttpMethodEnum, PagesFunction<Env, string, T>>
  >,
): PagesFunction<Env, string, T> {
  return async (context) => {
    const method = httpMethodsSchema.safeParse(context.request.method);
    if (!method.success || !methodMapper[method.data]) {
      return errorResponse.METHOD_NOT_ALLOWED();
    }

    return tryCatchWrapper(methodMapper[method.data]!)(context);
  };
}
