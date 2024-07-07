import { StripeSessionResult } from "@stripe-entity";
import { insertAddress } from "@address-db";
import { validateStripeAddress } from "@address-entity";
import {
  addToOrder,
  checkIfOrderExists,
  getOrderById,
  insertOrder,
} from "@order-db";
import { insertPayment } from "@payment-db";
import { getPaymentFromSessionResult } from "@payment-entity";
import { Order } from "@order-entity";
import { errors } from "@error-handling-utils";
import { productIdAndQuantitySchema } from "@product-entity";
import { emptyCart } from "@cart-db";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<Order> => {
  const orderAlreadyExists = await checkIfOrderExists(sessionResult.id);

  if (orderAlreadyExists) {
    throw errors.ORDER_ALREADY_EXISTS();
  }

  const [{ addressId }] = await insertAddress({
    ...validateStripeAddress(sessionResult.customer_details?.address),
  });
  const [{ paymentId }] = await insertPayment({
    ...getPaymentFromSessionResult(sessionResult),
  });

  const {
    userId,
    products: productsString,
    cartId,
  } = sessionResult.metadata ?? {};

  const [{ orderId }] = await insertOrder({
    addressId,
    paymentId,
    userId,
    orderId: sessionResult.id,
  });

  await insertProductsToOrder(productsString, orderId);

  const order = await getOrderById(orderId);

  if (!order) {
    throw errors.UNABLE_TO_CREATE_ORDER();
  }

  if (cartId) {
    await emptyCart(cartId);
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
