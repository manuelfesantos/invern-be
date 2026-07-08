import type { ProductDetails } from "@product-entity";
import { insertProductSchema } from "@product-entity";
import { updateProductOperation } from "./operations/update-product";

// `stock` is deliberately excluded: it lives in three stores (D1/KV/R2) and must
// only change through the dedicated stock write-through path, never a plain
// product edit (which would silently desync KV/R2). Any `stock` in the body is
// dropped by the schema.
const updateProductSchema = insertProductSchema.omit({ stock: true });

export const updateProduct = async (
  id: string,
  body: unknown,
): Promise<ProductDetails | undefined> => {
  return await updateProductOperation(id, updateProductSchema.parse(body));
};
