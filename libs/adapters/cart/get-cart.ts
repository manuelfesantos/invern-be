import { prepareStatement } from "@db-adapter";
import { Cart, CartItem, cartItemSchema } from "@cart-entity";

export const getCartById = async (cartId: string): Promise<Cart> => {
  const { results } = await prepareStatement(
    `SELECT products.*, productsCarts.quantity, url as imageUrl, alt as imageAlt FROM productsCarts 
                JOIN products ON productsCarts.productId = products.productId
                JOIN images ON products.productId = images.productId
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
      ? results.map((result) => getCartItemFromResult(result))
      : [],
  };
};

const getCartItemFromResult = (
  result: Record<string, unknown> | null,
): CartItem => {
  const { productId, productName, price, imageUrl, imageAlt, quantity } =
    result ?? {};
  return cartItemSchema.parse({
    productId,
    productName,
    price,
    quantity,
    productImage: {
      imageUrl,
      imageAlt,
    },
  });
};
