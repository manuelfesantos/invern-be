import { prepareStatement } from "@db-adapter";
import { Product } from "@product-entity";

export const getProducts = async (search: string | null) => {
  return search ? getProductsBySearch(search) : getAllProducts();
};

const getProductsBySearch = async (search?: string) => {
  return prepareStatement(
    `SELECT * FROM products WHERE name LIKE '%${search}%' OR description LIKE '%${search}%'`,
  ).all<Product>();
};

const getAllProducts = async () => {
  return prepareStatement(`SELECT * FROM products`).all<Product>();
};
