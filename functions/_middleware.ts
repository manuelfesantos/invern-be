import { Env } from "@request-entity";
import honeyCombPlugin, {
  PluginData,
  //@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
} from "@cloudflare/pages-plugin-honeycomb";
import { initDb } from "@db";
import { errorResponse, successResponse } from "@response-entity";
import { initSendgrid } from "@mail-utils";
import { HttpMethodEnum } from "@http-entity";
import { initAuthSecretClient } from "@kv-adapter";
import { setSecrets } from "@jwt-utils";
import { setLoggerLevel, withLogger } from "@logger-utils";
import { setEnv, setHosts, setStripeEnv } from "@http-utils";
import {
  initZoneId,
  initCacheApiKey,
  stockClient,
  countriesClient,
} from "@r2-adapter";
import { stringifyObject } from "@string-utils";
import { initCacheApiEmail } from "../libs/adapters/r2/utils";

export const startLogger: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  setHosts(env.FRONTEND_HOST, env.STOCK_HOST, env.COUNTRIES_HOST);
  if (request.method === "HEAD") {
    return errorResponse.METHOD_NOT_ALLOWED();
  } else if (request.method === HttpMethodEnum.OPTIONS) {
    return successResponse.OK("success");
  }
  return honeyCombPlugin({
    apiKey: env.HONEYCOMB_API_KEY,
    dataset: env.HONEYCOMB_DATASET,
    redactRequestHeaders: [
      "authorization",
      "cookie",
      "referer",
      "cf-access-jwt-assertion",
      "cf-connecting-ip",
      "host",
      "x-forwarded-for",
      "x-real-ip",
    ],
  })(context);
};

export const setGlobalEnvs: PagesFunction<Env, string, PluginData> = async (
  context,
) => {
  const { env, data, request } = context;
  const { tracer: logger } = data.honeycomb;

  const country = request.headers.get("country");

  logger.addData({
    country: country || request.cf?.country,
  });

  initDb(env.INVERN_DB);
  initAuthSecretClient(env.AUTH_KV);
  initSendgrid(env.SENDGRID_API_KEY);
  setSecrets(env.TOKEN_SECRET, env.REFRESH_TOKEN_SECRET);
  initZoneId(env.ZONE_ID);
  initCacheApiKey(env.CACHE_API_KEY);
  initCacheApiEmail(env.CACHE_API_EMAIL);
  setStripeEnv(env.STRIPE_ENV);
  setEnv(env.ENV);
  setLoggerLevel(Number(env.LOGGER_LEVEL));
  stockClient.init(env.STOCK_BUCKET);
  countriesClient.init(env.COUNTRIES_BUCKET);
  logger.addData({
    stockBucket: stringifyObject(env.STOCK_BUCKET),
  });
  return withLogger(logger, context.next);
};

export const onRequest = [startLogger, setGlobalEnvs];
