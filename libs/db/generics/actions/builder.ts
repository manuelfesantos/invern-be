import type {
  Action,
  BaseMapperFunction,
  BasePreProcessorFunction,
  BaseQueryFunction,
} from "@generics-db";

export const actionBuilder = <
  Handler extends BaseQueryFunction,
  PreProcessor extends
    | BasePreProcessorFunction<Handler>
    | undefined = undefined,
  Mapper extends BaseMapperFunction<Handler> | undefined = undefined,
>(
  handler: Handler,
  mapper?: Mapper,
  preProcessor?: PreProcessor,
): ((
  ...params: PreProcessor extends BasePreProcessorFunction<Handler>
    ? Parameters<PreProcessor>
    : Parameters<Handler>
) => Action<Handler, Mapper, PreProcessor>) => {
  return (...params) => {
    return {
      params,
      query: handler,
      run: (async () => {
        let handlerParams = params as
          | (PreProcessor extends BasePreProcessorFunction<Handler>
              ? Awaited<ReturnType<PreProcessor>>
              : Parameters<Handler>)
          | Parameters<Handler>;

        if (preProcessor) {
          handlerParams = await preProcessor(...params);
        }
        const queryResult = await handler(...handlerParams);
        return mapper?.(queryResult) ?? queryResult;
      }) as Action<Handler, Mapper, PreProcessor>["run"],
      map: mapper,
      preProcess: preProcessor,
    };
  };
};
