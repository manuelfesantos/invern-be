import { prepareStatement } from "@db-utils";
import { ProductDetails } from "@product-entity";
import { errors } from "@error-handling-utils";

export const getProductById = async (id: string): Promise<ProductDetails> => {
  const product = await prepareStatement(
    `SELECT productId, productName, products.description, price, stock, collectionName FROM products 
            JOIN collections ON products.collectionId = collections.collectionId
            WHERE productId = '${id}'`,
  ).first<ProductDetails>();
  if (!product) {
    throw errors.PRODUCT_NOT_FOUND();
  }
  return product;
};
