import { prepareStatement } from "@db-adapter";
import { Product } from "@product-entity";

export const getProducts = async (search: string | null) => {
  return search ? getProductsBySearch(search) : getAllProducts();
};

const getProductsBySearch = async (search?: string) => {
  return prepareStatement(
    `SELECT productId, productName, price FROM products WHERE productName LIKE '%${search}%' OR description LIKE '%${search}%'`,
  ).all<Product>();
};

const getAllProducts = async () => {
  return prepareStatement(
    `SELECT productId, productName, price FROM products`,
  ).all<Product>();
};
