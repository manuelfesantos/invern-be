import { successResponse } from "@response-entity";
import { getAllCollections, addCollection } from "@collection-module";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

const GET: PagesFunction = async (): Promise<Response> => {
  const collections = await getAllCollections();
  return successResponse.OK("success getting collections", collections);
};

const POST: PagesFunction = async ({ request }): Promise<Response> => {
  const body = await getBodyFromRequest(request);
  const collection = await addCollection(body);
  return successResponse.CREATED("success adding collection", collection);
};

export const onRequest = requestHandler({ GET, POST });
