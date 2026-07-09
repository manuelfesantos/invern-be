import { getSelectOrdersByIdAction, getUpdateOrderAction } from "@order-db";
import type { Order } from "@order-entity";
import { insertOrderSchema } from "@order-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { errors } from "@error-handling-utils";

/**
 * Admin may correct only delivery-facing details on an existing (often paid)
 * order. Everything financial/immutable — `stripeId`, `paymentId`, `products`,
 * `userId`, `shippingTransactionId`, totals — is excluded. Cancellation goes
 * through `/cancel` and fulfillment through `/fulfillment`, not this generic
 * update. Unknown keys are stripped (zod default), so a stray `stripeId` in the
 * body is ignored, never written.
 */
const adminOrderUpdateSchema = insertOrderSchema
  .pick({ address: true, personalDetails: true })
  .partial();

export const updateOrder = async (
  orderId: string,
  body: unknown,
): Promise<Order> => {
  const orderUpdate = adminOrderUpdateSchema.parse(body);

  // Redacted audit trail: log which fields changed (names, not PII values).
  logger().info("Admin updated order", {
    useCase: LoggerUseCaseEnum.UPDATE_ORDER,
    data: { orderId, updatedFields: Object.keys(orderUpdate) },
  });

  if (Object.keys(orderUpdate).length) {
    await getUpdateOrderAction(orderId, orderUpdate).run();
  }

  const [updatedOrder] = await getSelectOrdersByIdAction(orderId).run();
  if (!updatedOrder) {
    throw errors.ORDER_NOT_FOUND();
  }
  return updatedOrder;
};
