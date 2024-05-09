import { getCollectionById } from "@collection-adapter";
import { getProductsByCollectionId } from "@product-adapter";
import { CollectionDetails, collectionDetailsSchema } from "@collection-entity";
import { successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";

export const getCollectionDetails = async (
  id: HttpParams,
): Promise<Response> => {
  const collectionId = uuidSchema("collection id").parse(id);
  const collection = await getCollectionById(collectionId);
  const products = await getProductsByCollectionId(collectionId);
  const collectionDetails: CollectionDetails = collectionDetailsSchema.parse({
    ...collection,
    products,
  });
  return successResponse.OK(
    "success getting collection details",
    collectionDetails,
  );
};
