import { insertProduct } from "@product-db";
import { insertProductSchema } from "@product-entity";
import { successResponse } from "@response-entity";

export const addProduct = async (body: unknown): Promise<Response> => {
  const [{ productId }] = await insertProduct(insertProductSchema.parse(body));

  return successResponse.CREATED("success adding product", {
    productId,
  });
};
