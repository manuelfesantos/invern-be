import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { getLogger } from "@logger-utils";
import { getCartById } from "@cart-db";

export const validateCartId = async (cartId: string): Promise<void> => {
  const id = uuidSchema("cart id").parse(cartId);
  const cartToValidate = await getCartById(id);
  const cartIsValid = cartToValidate !== undefined;

  getLogger().addData({ cartIsValid });
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
};
