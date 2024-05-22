import { getCollectionById } from "@collection-db";
import { successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";

export const getCollectionDetails = async (
  id: HttpParams,
): Promise<Response> => {
  const collectionId = uuidSchema("collection id").parse(id);
  const collection = await getCollectionById(collectionId);
  if (!collection) {
    throw errors.COLLECTION_NOT_FOUND();
  }
  return successResponse.OK("success getting collection details", collection);
};
