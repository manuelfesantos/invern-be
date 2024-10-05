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
import { withLogger } from "@logger-utils";
import { setHosts } from "@http-utils";
import { initZoneId, initCacheApiKey, stockClient } from "@r2-adapter";
import { stringifyObject } from "@string-utils";
import { initCacheApiEmail } from "../libs/adapters/r2/utils";

export const startLogger: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  setHosts(env.FRONTEND_HOST, env.STOCK_HOST);
  if (request.method === "HEAD") {
    return errorResponse.METHOD_NOT_ALLOWED();
  } else if (request.method === HttpMethodEnum.OPTIONS) {
    return successResponse.OK("success");
  }
  return honeyCombPlugin({
    apiKey: env.HONEYCOMB_API_KEY,
    dataset: env.HONEYCOMB_DATASET,
  })(context);
};

export const setGlobalEnvs: PagesFunction<Env, string, PluginData> = async (
  context,
) => {
  const { env, data, request } = context;
  const { tracer: logger } = data.honeycomb;

  logger.addData({
    country: request.cf?.country,
  });

  initDb(env.INVERN_DB);
  initAuthSecretClient(env.AUTH_KV);
  initSendgrid(env.SENDGRID_API_KEY);
  setSecrets(env.TOKEN_SECRET, env.REFRESH_TOKEN_SECRET);
  initZoneId(env.ZONE_ID);
  initCacheApiKey(env.CACHE_API_KEY);
  initCacheApiEmail(env.CACHE_API_EMAIL);
  stockClient.init(env.STOCK_BUCKET);
  logger.addData({
    stockBucket: stringifyObject(env.STOCK_BUCKET),
  });
  return withLogger(logger, context.next);
};

export const onRequest = [startLogger, setGlobalEnvs];
