import { successResponse } from "@response-entity";
import { getProducts, getProductsBySearch } from "@product-db";

export const getAllProducts = async (
  search: string | null,
): Promise<Response> => {
  if (search) {
    const products = await getProductsBySearch(search);
    return successResponse.OK("success getting all products", products);
  }
  const products = await getProducts();
  return successResponse.OK("success getting all products", products);
};
