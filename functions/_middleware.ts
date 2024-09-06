import { Env } from "@request-entity";
import honeyCombPlugin, {
  PluginData,
  //@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
} from "@cloudflare/pages-plugin-honeycomb";
import { initDb } from "@db";
import { setGlobalTimer } from "@timer-utils";
import { errorResponse, successResponse } from "@response-entity";
import { initSendgrid } from "@mail-utils";
import { HttpMethodEnum } from "@http-entity";
import { initAuthSecretClient } from "@kv-adapter";
import { setSecrets } from "@jwt-utils";
import { withLogger } from "@logger-utils";

export const startLogger: PagesFunction<Env> = async (context) => {
  if (context.request.method === "HEAD") {
    return errorResponse.METHOD_NOT_ALLOWED();
  } else if (context.request.method === HttpMethodEnum.OPTIONS) {
    return successResponse.OK("success");
  }
  return honeyCombPlugin({
    apiKey: context.env.HONEYCOMB_API_KEY,
    dataset: context.env.HONEYCOMB_DATASET,
  })(context);
};

export const setGlobalEnvs: PagesFunction<Env, string, PluginData> = async (
  context,
) => {
  setGlobalTimer();
  const { env, data } = context;
  const { tracer: logger } = data.honeycomb;
  initDb(env.INVERN_DB);
  initAuthSecretClient(env.AUTH_KV);
  initSendgrid(env.SENDGRID_API_KEY);
  setSecrets(env.TOKEN_SECRET, env.REFRESH_TOKEN_SECRET);
  return withLogger(logger, context.next);
};

export const onRequest = [startLogger, setGlobalEnvs];
