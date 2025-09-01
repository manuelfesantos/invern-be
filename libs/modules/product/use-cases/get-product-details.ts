import { getSelectProductByIdAction } from "@product-db";
import type { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { extendProductDetails } from "@extender-utils";
import { getSelectCollectionByIdAction } from "@collection-db";
import type {
  ExtendedProductWithCollectionDetails,
  ProductWithCollectionDetails} from "@product-entity";
import {
  productWithCollectionDetailsSchema,
} from "@product-entity";

export async function getProductDetails(
  id: HttpParams,
  shouldExtend: true,
): Promise<ExtendedProductWithCollectionDetails>;
export async function getProductDetails(
  id: HttpParams,
  shouldExtend: false,
): Promise<ProductWithCollectionDetails>;
export async function getProductDetails(
  id: HttpParams,
  shouldExtend: boolean,
): Promise<
  ExtendedProductWithCollectionDetails | ProductWithCollectionDetails
> {
  const productId = uuidSchema("product id").parse(id);
  const product = await getSelectProductByIdAction(productId).run();

  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  const { name } =
    (await getSelectCollectionByIdAction(product.collectionId).run()) || {};

  if (!name) {
    throw errors.COLLECTION_NOT_FOUND();
  }

  const productWithCollectionDetails = productWithCollectionDetailsSchema.parse(
    {
      ...product,
      collection: {
        id: product.collectionId,
        name,
      },
    },
  );

  if (!shouldExtend) {
    return productWithCollectionDetails;
  }

  return extendProductDetails(productWithCollectionDetails);
}
