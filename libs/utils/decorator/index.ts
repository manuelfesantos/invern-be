import { generateErrorResponse } from "@response-entity";
import type { Data } from "@http-entity";
import type Env from "@env-entity";

export interface RequestHandlerProps {
  errorHandler?: (error: unknown) => Response;
  preProcess?: () => void;
  postProcess?: (response: Response) => Response;
}

interface MiddlewareHandlerProps {
  errorHandler?: (error: unknown) => Response;
  preProcess?: () => void;
}

const tryCatchWrapper = <T extends Data>(
  fn: PagesFunction<Env, string, T>,
  errorHandler: (error: unknown) => Response = generateErrorResponse,
  preProcess?: () => void,
): PagesFunction<Env, string, T> => {
  return async (context): Promise<Response> => {
    try {
      if (preProcess) {
        preProcess();
      }
      return await fn(context);
    } catch (error) {
      return errorHandler(error);
    }
  };
};

export const middlewareRequestHandler = <T extends Data>(
  fn: PagesFunction<Env, string, T>,
  { errorHandler }: MiddlewareHandlerProps = {},
): PagesFunction<Env, string, T> => {
  return tryCatchWrapper(fn, errorHandler);
};

export const requestHandler = <T extends Data>(
  handler: PagesFunction<Env, string, T>,
  { errorHandler, preProcess, postProcess }: RequestHandlerProps = {},
): PagesFunction<Env, string, T> => {
  return async (context) => {
    const response = await tryCatchWrapper(
      handler,
      errorHandler,
      preProcess,
    )(context);
    return postProcess?.(response) ?? response;
  };
};
