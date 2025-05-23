import { getSelectOrdersByIdAction } from "@order-db";
import { errors } from "@error-handling-utils";
import { HttpParams } from "@http-entity";
import { logger } from "@logger-utils";
import { extendOrder } from "@extender-utils";
import { clientOrderSchema, ExtendedClientOrder, Order } from "@order-entity";
import { contextStore } from "@context-utils";
import { decrypt } from "@crypto-utils";

export async function getOrder(
  orderId: HttpParams,
  shouldValidateUser: true,
  email?: string,
): Promise<ExtendedClientOrder>;
export async function getOrder(
  orderId: HttpParams,
  shouldValidateUser: false,
  email?: string,
): Promise<Order>;
export async function getOrder(
  orderId: HttpParams,
  shouldValidateUser: boolean,
  email?: string,
): Promise<ExtendedClientOrder | Order> {
  const [order] = await getSelectOrdersByIdAction(orderId as string).run();
  if (!order) {
    throw errors.ORDER_NOT_FOUND();
  }

  logger().addRedactedData({
    orderId: order.id,
  });

  if (shouldValidateUser) {
    if (order.userId) {
      const { userId } = contextStore.context;
      if (!userId || userId !== order.userId) {
        throw errors.UNAUTHORIZED("User does not match order");
      }
    } else {
      if (email) {
        if (email !== order.personalDetails.email) {
          throw errors.UNAUTHORIZED("Email does not match order");
        }
      } else {
        const { customerEmail: encryptedEmail } = contextStore.context;
        if (!encryptedEmail) {
          throw errors.NO_EMAIL_PROVIDED_WHILE_GETTING_ORDER();
        }
        const cookieEmail = await decrypt(encryptedEmail);
        if (cookieEmail !== order.personalDetails.email) {
          throw errors.NO_EMAIL_PROVIDED_WHILE_GETTING_ORDER();
        }
      }
    }
  }

  return shouldValidateUser
    ? extendOrder(clientOrderSchema.parse(order))
    : order;
}
