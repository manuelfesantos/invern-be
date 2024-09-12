import {
  ProductIdAndQuantity,
  productIdAndQuantitySchema,
} from "@product-entity";
import { getLogger } from "@logger-utils";
import { stringifyObject } from "@string-utils";

export const getProductsFromMetadata = (
  productString: string,
): ProductIdAndQuantity[] => {
  if (!productString.includes("|") || !productString.includes(":")) {
    const logger = getLogger();
    logger.addData({
      message: `Invalid product string: ${stringifyObject(productString)}`,
    });
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
