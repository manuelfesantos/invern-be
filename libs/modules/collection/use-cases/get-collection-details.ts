import { getCollectionById } from "@collection-db";
import { successResponse } from "@response-entity";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { Country } from "@country-entity";
import { extendProduct } from "@price-utils";

export const getCollectionDetails = async (
  id: HttpParams,
  country?: Country,
): Promise<Response> => {
  const collectionId = uuidSchema("collection id").parse(id);
  const collection = await getCollectionById(collectionId);
  if (!collection) {
    throw errors.COLLECTION_NOT_FOUND();
  }
  if (country) {
    return successResponse.OK("success getting collection details", {
      ...collection,
      products: collection.products.map((product) =>
        extendProduct(product, country),
      ),
    });
  }
  return successResponse.OK("success getting collection details", collection);
};
