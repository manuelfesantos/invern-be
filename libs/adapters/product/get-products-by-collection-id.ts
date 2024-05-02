import { prepareStatement } from "@db-adapter";
import { Product } from "@product-entity";

export const getProductsByCollectionId = async (collectionId: string) => {
  return await prepareStatement(
    `SELECT productId, productName, price FROM products WHERE collectionId = '${collectionId}'`,
  ).all<Product>();
};
