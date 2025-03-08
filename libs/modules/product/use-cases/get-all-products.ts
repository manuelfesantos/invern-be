import { getProducts, getProductsBySearch } from "@product-db";
import { logger } from "@logger-utils";
import { extendProduct } from "@extender-utils";
import { ExtendedProduct } from "@product-entity";
import { LoggerUseCaseEnum } from "@logger-entity";

export const getAllProducts = async (
  search: string | null,
): Promise<ExtendedProduct[]> => {
  if (search) {
    logger().info("getting products by search", {
      useCase: LoggerUseCaseEnum.GET_PRODUCT_LIST,
      data: {
        search,
      },
    });
    const products = await getProductsBySearch(search);
    return products.map(extendProduct);
  }
  const products = await getProducts();
  return products.map(extendProduct);
};
