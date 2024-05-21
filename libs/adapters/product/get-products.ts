import { prepareStatement } from "@db-utils";
import { Product } from "@product-entity";
import { getProductsFromResults } from "./utils/get-products-from-results";

export const getProducts = async (
  search: string | null,
  ids?: string[],
): Promise<Product[]> => {
  let results: Record<string, unknown>[] = [];
  if (search) {
    results = await getProductsBySearch(search);
  } else if (ids) {
    results = await getProductsByIds(ids);
  } else {
    results = await getAllProducts();
  }
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

const getProductsByIds = async (
  ids: string[],
): Promise<Record<string, unknown>[]> => {
  const { results } = await prepareStatement(
    `SELECT products.productId, productName, price, stock, url as imageUrl, alt as imageAlt FROM products
            LEFT JOIN images ON products.productId = images.productId
            WHERE products.productId IN (${ids.map((id) => `'${id}'`)})
            GROUP BY products.productId`,
  ).all();
  return results;
};
