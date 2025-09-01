import { successResponse } from "@response-entity";
import { contextStore } from "@context-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(() => {
  const { country } = contextStore.context;
  return successResponse.OK("Success getting country by code", country);
});
