import {
  deleteCollection,
  getCollectionDetails,
  updateCollection,
} from "@collection-module";
import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

const GET: PagesFunction = async ({ params }) => {
  const collections = await getCollectionDetails(params.id as string, false);
  return successResponse.OK("Collections fetched successfully", collections);
};

const PUT: PagesFunction = async ({ params, request }) => {
  const body = await getBodyFromRequest(request);
  const collections = await updateCollection(params.id as string, body);
  return successResponse.OK("Collections updated successfully", collections);
};

const DELETE: PagesFunction = async ({ params }) => {
  await deleteCollection(params.id as string);
  return successResponse.OK("Collections deleted successfully");
};

export const onRequest = requestHandler({ GET, PUT, DELETE });
