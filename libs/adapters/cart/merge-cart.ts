import { batchStatements, prepareStatement } from "@db-adapter";
import { ProductIdAndQuantity } from "@product-entity";

export const mergeCart = async (
  cartId: string,
  items: ProductIdAndQuantity[],
): Promise<void> => {
  const productInserts = items.map(({ productId, quantity }) => {
    return `('${cartId}', '${productId}', ${quantity})`;
  });
  const query = `INSERT INTO productsCarts (cartId, productId, quantity) VALUES `;
  const statement = prepareStatement(query + productInserts.join(", "));
  await statement.run();
};
