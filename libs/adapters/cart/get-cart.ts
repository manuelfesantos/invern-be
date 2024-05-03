import { prepareStatement } from "@db-adapter";
import { productWithQuantitySchema } from "@product-entity";
import { Cart } from "@cart-entity";

export const getCartById = async (cartId: string): Promise<Cart> => {
  const { results } = await prepareStatement(
    `SELECT products.*, productsCarts.quantity FROM productsCarts 
                JOIN products ON productsCarts.productId = products.productId
                WHERE cartId = '${cartId}'`,
  ).all();
  return getCartFromResults(cartId, results);
};

const getCartFromResults = (
  cartId: string,
  results: Record<string, unknown>[] | null,
): Cart => {
  return {
    cartId,
    products: results
      ? results.map((result) => productWithQuantitySchema.parse(result))
      : [],
  };
};
