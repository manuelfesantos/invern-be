import { successResponse } from "@response-entity";
import { getAllCollections } from "@collection-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";

const GET: PagesFunction = async (): Promise<Response> => {
  const collections = await getAllCollections();
  return successResponse.OK("success getting collections", collections);
};

export const onRequest = requestHandler({ GET });
