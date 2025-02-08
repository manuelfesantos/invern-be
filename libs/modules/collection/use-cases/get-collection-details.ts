import { selectCollectionById } from "@collection-db";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { extendProduct } from "@price-utils";
import { ExtendedCollectionDetails } from "@collection-entity";

export const getCollectionDetails = async (
  id: HttpParams,
): Promise<ExtendedCollectionDetails> => {
  const collectionId = uuidSchema("collection id").parse(id);
  const collection = await selectCollectionById(collectionId);
  if (!collection) {
    throw errors.COLLECTION_NOT_FOUND();
  }

  return {
    ...collection,
    products: collection.products.map((product) => extendProduct(product)),
  };
};
