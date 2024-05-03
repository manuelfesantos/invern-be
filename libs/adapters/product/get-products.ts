import { prepareStatement } from "@db-adapter";
import { Product } from "@product-entity";
import { getProductsFromResults } from "./utils/get-products-from-results";

export const getProducts = async (
  search: string | null,
): Promise<Product[]> => {
  const results = search
    ? await getProductsBySearch(search)
    : await getAllProducts();
  return getProductsFromResults(results);
};

const getProductsBySearch = async (
  search?: string,
): Promise<Record<string, unknown>[]> => {
  const { results } = await prepareStatement(
    `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products 
            JOIN images ON products.productId = images.productId
            WHERE productName LIKE '%${search}%' OR description LIKE '%${search}%'
            GROUP BY products.productId`,
  ).all();
  return results;
};

const getAllProducts = async (): Promise<Record<string, unknown>[]> => {
  const { results } = await prepareStatement(
    `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products
            LEFT JOIN images ON products.productId = images.productId
            GROUP BY products.productId`,
  ).all();
  return results;
};
