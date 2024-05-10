import { Env } from "@request-entity";
import honeyCombPlugin, {
  PluginData,
  //@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
} from "@cloudflare/pages-plugin-honeycomb";
import { initDb } from "@db-utils";
import { initLogger } from "@logger-utils";

export const startLogger: PagesFunction<Env> = async (context) => {
  return honeyCombPlugin({
    apiKey: context.env.HONEYCOMB_API_KEY,
    dataset: context.env.HONEYCOMB_DATASET,
  })(context);
};

export const setGlobalEnvs: PagesFunction<Env, string, PluginData> = async (
  context,
) => {
  const { env, data, request } = context;
  initDb(env.INVERN_DB);
  initLogger(data);
  data.honeycomb.tracer.addData({ country: request.cf?.country });
  return context.next();
};

export const onRequest = [startLogger, setGlobalEnvs];
