import { addToCart } from "@cart-adapter";
import { successResponse } from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductId } from "@product-adapter";

export const addProductToCart = async (
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { productId, quantity } = productIdAndQuantitySchema.parse(body);
  await validateProductId(productId);
  await addToCart(cartId, productId, quantity);
  return successResponse.OK("product added to cart");
};
