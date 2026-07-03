import type { PluginData } from "@cloudflare/pages-plugin-honeycomb";
import honeyCombPlugin from "@cloudflare/pages-plugin-honeycomb";
import { HttpMethodEnum } from "@http-entity";
import { withLogger } from "@logger-utils";
import { middlewareRequestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";
import { setEnv } from "@env-utils";
import {
  applyCorsHeaders,
  corsPreflightResponse,
  getAllowedOrigins,
} from "@http-utils";

export const startLogger = middlewareRequestHandler(async (context) => {
  const { env, request } = context;

  // Answer CORS preflight in every environment, without auth, echoing an
  // allow-listed origin. Runs before `setEnv`, so origins come from `env`.
  if (request.method === HttpMethodEnum.OPTIONS) {
    return corsPreflightResponse(request, getAllowedOrigins(env));
  }

  if (request.method === HttpMethodEnum.HEAD) {
    return new Response("Method not allowed", {
      status: 405,
    });
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
    const clientDataCenter = request.headers.get("x-data-center");
    const dataCenter = request.cf?.colo;

    logger.addData({
      clientDataCenter,
      dataCenter,
      country: country || request.cf?.country,
    });

    setEnv(env);

    const response = await contextStore.run(() => withLogger(logger, next));

    return applyCorsHeaders(request, response, getAllowedOrigins(env));
  },
);

export const onRequest = [startLogger, setGlobalEnvs];
