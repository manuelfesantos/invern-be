import { prepareStatement } from "@db-adapter";
import { Product, ProductDetails } from "@product-entity";
import { errors } from "@error-handling-utils";

export const getProductById = async (id: string) => {
  const product = await prepareStatement(
    `SELECT productId, productName, products.description, price, collectionName FROM products 
            JOIN collections ON products.collectionId = collections.collectionId
            WHERE productId = '${id}'`,
  ).first<ProductDetails>();
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }
  return product;
};
