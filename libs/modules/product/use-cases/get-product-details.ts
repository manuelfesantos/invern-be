import { getProductById } from "@product-db";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { extendProductDetails } from "@extender-utils";
import { selectCollectionById } from "@collection-db";
import {
  ExtendedProductWithCollectionDetails,
  productWithCollectionDetailsSchema,
} from "@product-entity";

export const getProductDetails = async (
  id: HttpParams,
): Promise<ExtendedProductWithCollectionDetails> => {
  const productId = uuidSchema("product id").parse(id);
  const product = await getProductById(productId);
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }

  const { name } = (await selectCollectionById(product.collectionId)) || {};

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

  return extendProductDetails(productWithCollectionDetails);
};
