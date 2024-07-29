import { addProductToCart } from "./add-product-to-cart";
import { cartActionSchema } from "./types/update-cart";
import { HttpParams, HttpResponseEnum } from "@http-entity";
import { removeProductFromCart } from "./remove-product-from-cart";
import { mergeCartItems } from "./merge-cart-items";
import { validateCartId } from "@cart-db";
import { getUserByCartId, incrementUserVersion } from "@user-db";

const DEFAULT_USER_VERSION = 1;

const actionMapper = {
  add: addProductToCart,
  remove: removeProductFromCart,
  merge: mergeCartItems,
};

export const updateCart = async (
  body: unknown,
  action: string,
  cartId: HttpParams,
): Promise<Response> => {
  const parsedCartId = cartId as string;
  const cartAction = cartActionSchema.parse(action);
  await validateCartId(parsedCartId);

  const response = await actionMapper[cartAction](body, parsedCartId);
  if (
    response.status === HttpResponseEnum.OK ||
    response.status === HttpResponseEnum.CREATED
  ) {
    const { userId, version } = await getUserByCartId(parsedCartId);
    await incrementUserVersion(userId, version || DEFAULT_USER_VERSION);
  }
  return response;
};
