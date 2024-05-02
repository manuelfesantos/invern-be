import { batchStatements, prepareStatement } from "@db-adapter";
import { ProductIdAndQuantity } from "@product-entity";

export const mergeCart = async (
  cartId: string,
  items: ProductIdAndQuantity[],
) => {
  const statements = items.map(({ productId, quantity }) => {
    return prepareStatement(
      `INSERT INTO productsCarts (cartId, productId, quantity) VALUES('${cartId}', '${productId}', ${quantity})`,
    );
  });
  await batchStatements(statements);
};
