//@ts-expect-error - unable to import from @cloudflare/pages-plugin-honeycomb
import { PluginData } from "@cloudflare/pages-plugin-honeycomb";

export type Logger = PluginData["honeycomb"]["tracer"];
