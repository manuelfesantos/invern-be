import { insertProductSchema, ProductDetails } from "@product-entity";
import { updateProductOperation } from "./operations/update-product";
export const updateProduct = async (
  id: string,
  body: unknown,
): Promise<ProductDetails | undefined> => {
  return await updateProductOperation(id, insertProductSchema.parse(body));
};
