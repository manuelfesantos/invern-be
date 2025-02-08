import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { selectCartById } from "@cart-db";
import { LoggerUseCaseEnum } from "@logger-entity";
import { Cart } from "@cart-entity";

export const validateCartId = async (cartId: string): Promise<Cart> => {
  const id = uuidSchema("cart id").parse(cartId);
  const cart = await selectCartById(id);
  const cartIsValid = cart !== undefined;

  logger().info("Validating Cart Id", LoggerUseCaseEnum.VALIDATE_CART_ID, {
    isValid: cartIsValid,
  });
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
  return cart;
};
