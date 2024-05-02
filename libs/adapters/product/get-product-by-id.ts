import { prepareStatement } from "@db-adapter";
import { Product } from "@product-entity";
import { errors } from "@error-handling-utils";

export const getProductById = async (id: string) => {
  const product = await prepareStatement(
    `SELECT * FROM products WHERE productId = '${id}'`,
  ).first<Product>();
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }
  return product;
};
