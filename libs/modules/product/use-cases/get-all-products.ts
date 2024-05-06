import { successResponse } from "@response-entity";
import { getProducts } from "@product-adapter";

export const getAllProducts = async (
  search: string | null,
): Promise<Response> => {
  const products = await getProducts(search);
  return successResponse.OK("success getting all products", products);
};
