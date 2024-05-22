import { Env } from "@request-entity";
import honeyCombPlugin, {
  PluginData,
  //@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
} from "@cloudflare/pages-plugin-honeycomb";
import { initDb } from "@db";
import { initLogger } from "@logger-utils";
import { setGlobalTimer } from "@timer-utils";
import { errorResponse } from "@response-entity";
import { initSendgrid } from "@mail-utils";

export const startLogger: PagesFunction<Env> = async (context) => {
  if (context.request.method === "HEAD") {
    return errorResponse.METHOD_NOT_ALLOWED();
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
  const { env, data, request } = context;
  initDb(env.INVERN_DB);
  initSendgrid(env.SENDGRID_API_KEY);
  const logger = initLogger(data);
  logger.addData({ country: request.cf?.country });

  return context.next();
};

export const onRequest = [startLogger, setGlobalEnvs];
