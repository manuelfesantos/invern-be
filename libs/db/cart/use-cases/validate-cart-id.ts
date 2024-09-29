import { uuidSchema } from "@global-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { getCartById } from "@cart-db";
import { LoggerUseCaseEnum } from "@logger-entity";

export const validateCartId = async (cartId: string): Promise<void> => {
  const id = uuidSchema("cart id").parse(cartId);
  const cartToValidate = await getCartById(id);
  const cartIsValid = cartToValidate !== undefined;

  logger().info("Validating Cart Id", LoggerUseCaseEnum.VALIDATE_CART_ID, {
    isValid: cartIsValid,
  });
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
};
