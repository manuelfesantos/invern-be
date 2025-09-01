import { successResponse } from "@response-entity";
import { addCollection, getAllCollections } from "@collection-module";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async () => {
  const collections = await getAllCollections();
  return successResponse.OK("Collections fetched successfully", collections);
});

export const onRequestPost = requestHandler(async ({ request }) => {
  const body = await getBodyFromRequest(request);
  const collection = await addCollection(body);
  return successResponse.OK("Collection created successfully", collection);
});
