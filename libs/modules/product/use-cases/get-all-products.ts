import { generateErrorResponse, successResponse } from "@response-entity";
import { getProducts } from "@product-adapter";

export const getAllProducts = async (
  search: string | null,
): Promise<Response> => {
  try {
    const products = await getProducts(search);
    return successResponse.OK("success getting all products", products);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
