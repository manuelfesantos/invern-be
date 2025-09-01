import {
  deleteCollection,
  getCollectionDetails,
  updateCollection,
} from "@collection-module";
import { successResponse } from "@response-entity";
import { getBodyFromRequest } from "@http-utils";
import { requestHandler } from "@decorator-utils";

export const onRequestGet = requestHandler(async ({ params }) => {
  const collections = await getCollectionDetails(params.id as string, false);
  return successResponse.OK("Collections fetched successfully", collections);
});

export const onRequestPut = requestHandler(async ({ params, request }) => {
  const body = await getBodyFromRequest(request);
  const collections = await updateCollection(params.id as string, body);
  return successResponse.OK("Collections updated successfully", collections);
});

export const onRequestDelete = requestHandler(async ({ params }) => {
  await deleteCollection(params.id as string);
  return successResponse.OK("Collections deleted successfully");
});
