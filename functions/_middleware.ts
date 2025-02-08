/* eslint-disable import/no-restricted-paths */
import honeyCombPlugin, {
  PluginData,
  //@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
} from "@cloudflare/pages-plugin-honeycomb";
import { initDb } from "@db";
import { errorResponse } from "@response-entity";
import { initSendgrid } from "@mail-utils";
import { HttpMethodEnum } from "@http-entity";
import { initAuthSecretClient } from "@kv-adapter";
import { setSecrets } from "@jwt-utils";
import { setLoggerLevel, withLogger } from "@logger-utils";
import { setDomain, setEnv, setHosts, setStripeEnv } from "@http-utils";
import {
  initZoneId,
  initCacheApiKey,
  stockClient,
  countriesClient,
} from "@r2-adapter";
import { initCacheApiEmail } from "../libs/adapters/r2/utils";
import { middlewareRequestHandler } from "@decorator-utils";
import { contextStore } from "@context-utils";
import { initEncryptionKey, setDefaultIv } from "@crypto-utils";

export const startLogger = middlewareRequestHandler(async (context) => {
  const { env, request } = context;
  setHosts(env.FRONTEND_HOST, env.STOCK_HOST, env.COUNTRIES_HOST);
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
    setDomain(env.DOMAIN);
    await initEncryptionKey(env.ENCRYPTION_KEY);
    setDefaultIv(env.DEFAULT_IV);
    stockClient.init(env.STOCK_BUCKET);
    countriesClient.init(env.COUNTRIES_BUCKET);
    return contextStore.run(() => withLogger(logger, next));
  },
);

export const onRequest = [startLogger, setGlobalEnvs];
