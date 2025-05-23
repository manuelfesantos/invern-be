import { successResponse } from "@response-entity";
import {
  deleteCollection,
  getCollectionDetails,
  updateCollection,
} from "@collection-module";
import { requestHandler } from "@decorator-utils";
import { PagesFunction } from "@cloudflare/workers-types";
import { getBodyFromRequest } from "@http-utils";

const GET: PagesFunction = async ({ params }): Promise<Response> => {
  const { id } = params;

  const collection = await getCollectionDetails(id as string, true);
  return successResponse.OK("success getting collection details", collection);
};

const PUT: PagesFunction = async ({ request, params }): Promise<Response> => {
  const { id } = params;
  const body = await getBodyFromRequest(request);

  const collection = await updateCollection(id as string, body);

  return successResponse.OK("success updating collection", collection);
};

const DELETE: PagesFunction = async ({ params }): Promise<Response> => {
  const { id } = params;

  await deleteCollection(id as string);

  return successResponse.OK("success deleting collection");
};

export const onRequest = requestHandler({ GET, PUT, DELETE });
