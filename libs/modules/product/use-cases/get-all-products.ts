import { successResponse } from "@response-entity";
import { getProducts, getProductsBySearch } from "@product-db";
import { logger } from "@logger-utils";

export const getAllProducts = async (
  search: string | null,
): Promise<Response> => {
  if (search) {
    logger().addData({ search });
    const products = await getProductsBySearch(search);
    return successResponse.OK("success getting all products", products);
  }
  const products = await getProducts();
  return successResponse.OK("success getting all products", products);
};
