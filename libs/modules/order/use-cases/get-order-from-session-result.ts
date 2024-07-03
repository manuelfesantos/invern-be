import { StripeSessionResult } from "@stripe-entity";
import { insertAddress } from "@address-db";
import { validateStripeAddress } from "@address-entity";
import { addToOrder, getOrderById, insertOrder } from "@order-db";
import { insertPayment } from "@payment-db";
import { getPaymentFromSessionResult } from "@payment-entity";
import { Order } from "@order-entity";
import { errors } from "@error-handling-utils";
import { productIdAndQuantitySchema } from "@product-entity";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<Order> => {
  const [{ addressId }] = await insertAddress({
    ...validateStripeAddress(sessionResult.customer_details?.address),
  });
  const [{ paymentId }] = await insertPayment({
    ...getPaymentFromSessionResult(sessionResult),
  });

  const { userId, productsString } = sessionResult.metadata ?? {};

  const [{ orderId }] = await insertOrder({
    addressId,
    paymentId,
    userId,
  });

  await insertProductsToOrder(productsString, orderId);

  const order = await getOrderById(orderId);

  if (!order) {
    throw errors.UNABLE_TO_CREATE_ORDER();
  }

  return order;
};

const insertProductsToOrder = async (
  productsString: string,
  orderId: string,
): Promise<void> => {
  if (productsString && orderId) {
    const products = JSON.parse(productsString);

    Array.isArray(products) &&
      (await addToOrder(
        products.map((product) => productIdAndQuantitySchema.parse(product)),
        orderId,
      ));
  }
};
