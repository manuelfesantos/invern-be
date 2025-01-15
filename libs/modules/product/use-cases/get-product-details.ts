import { successResponse } from "@response-entity";
import { getProductById } from "@product-db";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { Country } from "@country-entity";
import { extendProductDetails } from "@price-utils";
import { getCollectionById } from "@collection-db";
import { productWithCollectionDetailsSchema } from "@product-entity";

export const getProductDetails = async (
  id: HttpParams,
  country?: Country,
): Promise<Response> => {
  const productId = uuidSchema("product id").parse(id);
  const product = await getProductById(productId);
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }
  if (!country) {
    return successResponse.OK("success getting product details", product);
  }
  const { name } = (await getCollectionById(product.collectionId)) || {};

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

  return successResponse.OK(
    "success getting product details",
    extendProductDetails(productWithCollectionDetails, country),
  );
};
