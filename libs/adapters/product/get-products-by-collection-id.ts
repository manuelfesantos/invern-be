import { prepareStatement } from "@db-adapter";
import { Product } from "@product-entity";
import { getProductsFromResults } from "./utils/get-products-from-results";

export const getProductsByCollectionId = async (
  collectionId: string,
): Promise<Product[]> => {
  const { results } = await prepareStatement(
    `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products 
            LEFT JOIN images ON products.productId = images.productId
            WHERE products.collectionId = '${collectionId}'
            GROUP BY products.productId`,
  ).all();
  return getProductsFromResults(results);
};
