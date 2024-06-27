import { StripeSessionResult } from "@stripe-entity";
import { insertAddress } from "@address-db";
import { validateStripeAddress } from "@address-entity";
import { getOrderById, insertOrder } from "@order-db";
import { insertPayment } from "@payment-db";
import { getPaymentFromSessionResult } from "@payment-entity";
import { Order } from "@order-entity";
import { errors } from "@error-handling-utils";

export const getSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<Order> => {
  const [{ addressId }] = await insertAddress({
    ...validateStripeAddress(sessionResult.customer_details?.address),
  });
  const [{ paymentId }] = await insertPayment({
    ...getPaymentFromSessionResult(sessionResult),
  });

  const [{ orderId }] = await insertOrder({
    addressId,
    paymentId,
    userId: sessionResult.metadata?.userId ?? null,
  });

  const order = await getOrderById(orderId);

  if (!order) {
    throw errors.UNABLE_TO_CREATE_ORDER();
  }

  return order;

};
