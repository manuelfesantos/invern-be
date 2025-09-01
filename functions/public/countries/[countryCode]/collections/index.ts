import { successResponse } from "@response-entity";
import { getAllCollections, addCollection } from "@collection-module";
import { requestHandler } from "@decorator-utils";
import { getBodyFromRequest } from "@http-utils";

export const onRequestGet = requestHandler(async (): Promise<Response> => {
  const collections = await getAllCollections();
  return successResponse.OK("success getting collections", collections);
});

export const onRequestPost = requestHandler(
  async ({ request }): Promise<Response> => {
    const body = await getBodyFromRequest(request);
    const collection = await addCollection(body);
    return successResponse.CREATED("success adding collection", collection);
  },
);
