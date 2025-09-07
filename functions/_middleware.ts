import type { PluginData } from "@cloudflare/pages-plugin-honeycomb";
import honeyCombPlugin from "@cloudflare/pages-plugin-honeycomb";
import { HttpMethodEnum } from "@http-entity";
import { withLogger } from "@logger-utils";
import { middlewareRequestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";
import { setEnv } from "@env-utils";

export const startLogger = middlewareRequestHandler(async (context) => {
  const { env, request } = context;
  if (
    request.method === HttpMethodEnum.HEAD ||
    request.method === HttpMethodEnum.OPTIONS
  ) {
    if (env.ENV !== "local") {
      return new Response("Method not allowed", {
        status: 405,
      });
    } else {
      const response = new Response("All ok", {
        status: 200,
      });
      addLocalCorsHeaders(response);
      return response;
    }
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

    if (env.ENV === "local") {
      addLocalCorsHeaders(response);
    }
    return response;
  },
);

const addLocalCorsHeaders = (response: Response): Response => {
  response.headers.append(
    "Access-Control-Allow-Origin",
    "https://localhost:8081",
  );
  response.headers.append("Access-Control-Allow-Credentials", "true");
  response.headers.append(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, CF-Access-Client-Id, CF-Access-Client-Secret",
  );
  response.headers.append(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  return response;
};

export const onRequest = [startLogger, setGlobalEnvs];
