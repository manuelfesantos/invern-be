import {
  ProductIdAndQuantity,
  productIdAndQuantitySchema,
} from "@product-entity";
import { logger } from "@logger-utils";
import { stringifyObject } from "@string-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const getProductsFromMetadata = (
  productString: string,
): ProductIdAndQuantity[] => {
  if (!productString.includes("|") && !productString.includes(":")) {
    logger().error(
      `Invalid product string: ${stringifyObject(productString)}`,
      LoggerUseCaseEnum.GET_PRODUCTS_FROM_METADATA,
    );
    return [];
  }
  return productString.split("|").map((product: string) => {
    const [productId, quantity] = product.split(":");
    return productIdAndQuantitySchema.parse({
      productId,
      quantity: Number(quantity),
    });
  });
};
