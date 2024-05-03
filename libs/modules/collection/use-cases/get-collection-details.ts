import { getCollectionById } from "../../../adapters/collection/get-collection-by-id";
import { getProductsByCollectionId } from "@product-adapter";
import { CollectionDetails, collectionDetailsSchema } from "@collection-entity";
import { generateErrorResponse, successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";

export const getCollectionDetails = async (
  collectionId: HttpParams,
): Promise<Response> => {
  try {
    const collection = await getCollectionById(collectionId as string);
    const products = await getProductsByCollectionId(collectionId as string);
    const collectionDetails: CollectionDetails = collectionDetailsSchema.parse({
      ...collection,
      products,
    });
    return successResponse.OK(
      "success getting collection details",
      collectionDetails,
    );
  } catch (error) {
    return generateErrorResponse(error);
  }
};
