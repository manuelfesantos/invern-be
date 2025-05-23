import { successResponse } from "@response-entity";
import { addCollection, getAllCollections } from "@collection-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async () => {
  const collections = await getAllCollections();
  return successResponse.OK("Collections fetched successfully", collections);
};

const POST: PagesFunction = async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const collection = await addCollection(body);
  return successResponse.OK("Collection created successfully", collection);
};

export const onRequest = requestHandler({ GET, POST });
