import { getInsertProductAction } from "@product-db";
import { insertProductSchema } from "@product-entity";

export const addProduct = async (
  body: unknown,
): Promise<{ productId: string }> => {
  const [{ productId }] = await getInsertProductAction(
    insertProductSchema.parse(body),
  ).run();

  return { productId };
};
