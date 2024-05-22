import { successResponse } from "@response-entity";
import { getProductById } from "@product-db";
import { HttpParams } from "@http-entity";
import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";

export const getProductDetails = async (id: HttpParams): Promise<Response> => {
  const productId = uuidSchema("product id").parse(id);
  const product = await getProductById(productId);
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }
  return successResponse.OK("success getting product details", product);
};
