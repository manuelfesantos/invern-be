import { PagesFunction } from "@cloudflare/workers-types";

export const onRequest: PagesFunction = async (context) => {
  return new Response("Hello, World!");
};
