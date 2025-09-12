import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { getSelectCartByIdAction } from "@cart-db";
import { LoggerUseCaseEnum } from "@logger-entity";
import type { Cart } from "@cart-entity";
import * as z from "zod";

export const validateCartId = async (cartId?: string): Promise<Cart> => {
  if (!cartId) {
    logger().error("No cart provided", {
      useCase: LoggerUseCaseEnum.VALIDATE_CART_ID,
    });
    throw errors.CART_NOT_PROVIDED();
  }
  const id = z.uuidv4().parse(cartId);
  const cart = await getSelectCartByIdAction(id).run();
  const cartIsValid = cart !== undefined;

  logger().info("Validating Cart Id", {
    useCase: LoggerUseCaseEnum.VALIDATE_CART_ID,
    data: {
      isValid: cartIsValid,
    },
  });
  if (!cartIsValid) {
    throw errors.CART_NOT_FOUND();
  }
  return cart;
};
