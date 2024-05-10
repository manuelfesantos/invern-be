//@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
import { PluginData } from "@cloudflare/pages-plugin-honeycomb";
import { errors } from "@error-handling-utils";

let data: null | PluginData = null;

export const initLogger = (eventData: PluginData): void => {
  if (!data) {
    data = eventData;
  }
};

export const getLogger = (): PluginData["honeycomb"]["tracer"] => {
  if (!data) {
    throw errors.LOGGER_NOT_INITIALIZED();
  }
  return data.honeycomb.tracer;
};
