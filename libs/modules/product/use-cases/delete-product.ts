import { getDeleteProductAction } from "@product-db";

export const deleteProduct = async (id: string): Promise<void> => {
  await getDeleteProductAction(id).run();
};
