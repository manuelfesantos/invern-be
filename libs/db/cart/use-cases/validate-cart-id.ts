import { uuidSchema } from "@global-entity";
import { getCartById } from "../select";
import { errors } from "@error-handling-utils";

export const validateCartId = async (cartId: string): Promise<void> => {
  const id = uuidSchema("cart id").parse(cartId);
  const cartIsValid = Boolean(getCartById(id));
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
};
