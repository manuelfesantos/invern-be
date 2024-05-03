import { uuidSchema } from "@global-entity";
import { prepareStatement } from "@db-adapter";
import { errors } from "@error-handling-utils";

export const validateCartId = async (cartId: string): Promise<void> => {
  const id = uuidSchema("cart id").parse(cartId);
  const cartIsValid = Boolean(
    await prepareStatement(
      `SELECT cartId FROM users WHERE cartId = '${id}'`,
    ).first(),
  );
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
};
