import { generateErrorResponse, successResponse } from "@response-entity";
import { getProductById } from "@product-adapter";
import { HttpParams } from "@http-entity";

export const getProductDetails = async (id: HttpParams) => {
  try {
    const product = await getProductById(id as string);
    return successResponse.OK("success getting product details", product);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
