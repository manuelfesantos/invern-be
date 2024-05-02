import { generateErrorResponse, successResponse } from "@response-entity";
import { getProducts } from "@product-adapter";

export const getAllProducts = async (search: string | null) => {
  try {
    const { results } = await getProducts(search);
    return successResponse.OK("success getting all products", results);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
