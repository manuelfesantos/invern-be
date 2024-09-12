import { addProductToCart } from "./add-product-to-cart";
import { CartAction, cartActionSchema } from "./types/update-cart";
import { HttpResponseEnum } from "@http-entity";
import { removeProductFromCart } from "./remove-product-from-cart";
import { mergeCartItems } from "./merge-cart-items";
import { validateCartId } from "@cart-db";
import { incrementUserVersion } from "@user-db";
import { ProtectedModuleFunction } from "@response-entity";
import { getCart } from "../get-cart";
import { errors } from "@error-handling-utils";

const actionMapper = {
  [CartAction.add]: addProductToCart,
  [CartAction.remove]: removeProductFromCart,
  [CartAction.merge]: mergeCartItems,
};

export const cartActionMapper: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  action: string,
  cartId?: string,
  userId?: string,
): Promise<Response> => {
  const cartAction = cartActionSchema.parse(action);

  if (cartAction === CartAction.get) {
    return await getCart(tokens, remember, body, cartId);
  }

  if (!cartId || !userId) {
    throw errors.UNAUTHORIZED();
  }

  await validateCartId(cartId);
  const response = await actionMapper[cartAction](
    tokens,
    remember,
    body,
    cartId,
  );

  if (response.status === HttpResponseEnum.OK) {
    await incrementUserVersion(userId);
  }

  return response;
};
