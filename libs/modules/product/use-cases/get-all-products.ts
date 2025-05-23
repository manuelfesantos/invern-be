import {
  getSelectProductsAction,
  getSelectProductsBySearchAction,
} from "@product-db";
import { logger } from "@logger-utils";
import { extendProduct } from "@extender-utils";
import { ExtendedProduct, Product } from "@product-entity";
import { LoggerUseCaseEnum } from "@logger-entity";

export async function getAllProducts(
  search: string | null,
  shouldExtend: true,
): Promise<ExtendedProduct[]>;
export async function getAllProducts(
  search: string | null,
  shouldExtend: false,
): Promise<Product[]>;
export async function getAllProducts(
  search: string | null,
  shouldExtend: boolean,
): Promise<ExtendedProduct[] | Product[]> {
  if (search) {
    logger().info("getting products by search", {
      useCase: LoggerUseCaseEnum.GET_PRODUCT_LIST,
      data: {
        search,
      },
    });
    const products = await getSelectProductsBySearchAction(search).run();

    return shouldExtend ? products.map(extendProduct) : products;
  }
  const products = await getSelectProductsAction().run();
  return shouldExtend ? products.map(extendProduct) : products;
}
