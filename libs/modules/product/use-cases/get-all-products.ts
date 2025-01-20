import { successResponse } from "@response-entity";
import { getProducts, getProductsBySearch } from "@product-db";
import { logger } from "@logger-utils";
import { Country } from "@country-entity";
import { extendProduct } from "@price-utils";

export const getAllProducts = async (
  search: string | null,
  country?: Country,
): Promise<Response> => {
  if (search) {
    logger().addRedactedData({ search });
    const products = await getProductsBySearch(search);
    if (country) {
      return successResponse.OK(
        "success getting all products",
        products.map((product) => extendProduct(product, country)),
      );
    }
    return successResponse.OK("success getting all products", products);
  }
  const products = await getProducts();
  if (country) {
    return successResponse.OK(
      "success getting all products",
      products.map((product) => extendProduct(product, country)),
    );
  }
  return successResponse.OK("success getting all products", products);
};
