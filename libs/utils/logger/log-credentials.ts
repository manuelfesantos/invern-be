import { logger } from "./logger-store";

export const logCredentials = (
  cartId?: string | null,
  userId?: string | null,
): void => {
  logger().addRedactedData({
    ...(cartId && { "cart.id": cartId }),
    ...(userId && { "user.id": userId }),
  });
};
