import { getSelectCollectionByIdAction } from "@collection-db";
import type { HttpParams } from "@http-entity";
import { errors } from "@error-handling-utils";
import { extendProduct } from "@extender-utils";
import type {
  CollectionDetails,
  ExtendedCollectionDetails,
} from "@collection-entity";
import * as z from "zod";

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
  const collectionId = z.uuidv4().parse(id);
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
