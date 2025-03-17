import honeyCombPlugin, {
  PluginData,
} from "@cloudflare/pages-plugin-honeycomb";
import { errorResponse } from "@response-entity";
import { HttpMethodEnum } from "@http-entity";
import { withLogger } from "@logger-utils";
import { middlewareRequestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";
import { ENV } from "@env-utils";

export const startLogger = middlewareRequestHandler(async (context) => {
  const { env, request } = context;
  if (
    request.method === HttpMethodEnum.HEAD ||
    request.method === HttpMethodEnum.OPTIONS
  ) {
    return errorResponse.METHOD_NOT_ALLOWED();
  }
  return honeyCombPlugin({
    apiKey: env.HONEYCOMB_API_KEY,
    dataset: env.HONEYCOMB_DATASET,
    redactRequestHeaders: [
      "authorization",
      "cookie",
      "referer",
      "referrer",
      "cf-access-jwt-assertion",
      "cf-connecting-ip",
      "host",
      "x-forwarded-for",
      "x-real-ip",
    ],
  })(context);
});

export const setGlobalEnvs = middlewareRequestHandler<PluginData>(
  async (context) => {
    const { env, data, request, next } = context;

    const { tracer: logger } = data.honeycomb;
    const country = request.headers.get("country");
    const dataCenter = request.cf?.colo;

    logger.addData({
      dataCenter,
      country: country || request.cf?.country,
    });

    ENV.initialize(env);

    return contextStore.run(() => withLogger(logger, next));
  },
);

export const onRequest = [startLogger, setGlobalEnvs];
