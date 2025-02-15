import { errorResponse, generateErrorResponse } from "@response-entity";
import { Data, HandlerMethodMapper, httpMethodsSchema } from "@http-entity";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

const tryCatchWrapper = <T extends Data>(
  fn: PagesFunction<Env, string, T>,
  errorHandler: (error: unknown) => Response = generateErrorResponse,
  preProcess?: () => void,
): PagesFunction<Env, string, T> => {
  return async (context): Promise<Response> => {
    try {
      preProcess && preProcess();
      return await fn(context);
    } catch (error) {
      return errorHandler(error);
    }
  };
};

export const middlewareRequestHandler = <T extends Data>(
  fn: PagesFunction<Env, string, T>,
  errorHandler?: (error: unknown) => Response,
): PagesFunction<Env, string, T> => {
  return tryCatchWrapper(fn, errorHandler);
};

export const requestHandler = <T extends Data>(
  methodMapper: HandlerMethodMapper<T>,
  errorHandler?: (error: unknown) => Response,
  preProcess?: () => void,
): PagesFunction<Env, string, T> => {
  return async (context) => {
    const method = httpMethodsSchema.safeParse(context.request.method);
    if (!method.success || !methodMapper[method.data]) {
      return errorResponse.METHOD_NOT_ALLOWED();
    }
    return tryCatchWrapper(
      methodMapper[method.data]!,
      errorHandler,
      preProcess,
    )(context);
  };
};
