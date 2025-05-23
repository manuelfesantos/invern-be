import { getSelectCollectionByIdAction } from "@collection-db";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { extendProduct } from "@extender-utils";
import {
  CollectionDetails,
  ExtendedCollectionDetails,
} from "@collection-entity";

export async function getCollectionDetails(
  id: HttpParams,
  shouldExtend: false,
): Promise<CollectionDetails>;
export async function getCollectionDetails(
  id: HttpParams,
  shouldExtend: true,
): Promise<ExtendedCollectionDetails>;
export async function getCollectionDetails(
  id: HttpParams,
  shouldExtend: boolean,
): Promise<ExtendedCollectionDetails | CollectionDetails> {
  const collectionId = uuidSchema("collection id").parse(id);
  const collection = await getSelectCollectionByIdAction(collectionId).run();
  if (!collection) {
    throw errors.COLLECTION_NOT_FOUND();
  }
  if (shouldExtend) {
    return {
      ...collection,
      products: collection.products.map((product) => extendProduct(product)),
    };
  }
  return collection;
}
