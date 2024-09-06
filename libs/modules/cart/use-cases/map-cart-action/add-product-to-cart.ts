import { addToCart } from "@cart-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { productIdAndQuantitySchema } from "@product-entity";
import { validateProductId } from "@product-db";

export const addProductToCart: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  cartId: string,
): Promise<Response> => {
  const { productId, quantity } = productIdAndQuantitySchema.parse(body);
  await validateProductId(productId);
  await addToCart(cartId, productId, quantity);
  return protectedSuccessResponse.OK(
    tokens,
    "product added to cart",
    undefined,
    remember,
  );
};
