import { successResponse } from "@response-entity";
import { contextStore } from "@context-utils";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = () => {
  const { country } = contextStore.context;
  return successResponse.OK("Success getting country by code", country);
};

export const onRequest = requestHandler({ GET });
