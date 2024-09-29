import { StripeSessionResult } from "@stripe-entity";
import { insertAddress } from "@address-db";
import { validateStripeAddress } from "@address-entity";
import {
  addToOrder,
  checkIfOrderExists,
  getOrderById,
  insertOrder,
} from "@order-db";
import { getPaymentById, insertPaymentReturningId } from "@payment-db";
import { getPaymentFromSessionResult } from "@payment-entity";
import { ClientOrder, toClientOrder } from "@order-entity";
import { errors } from "@error-handling-utils";
import { emptyCart } from "@cart-db";
import { incrementUserVersion } from "@user-db";
import { getProductsFromMetadata } from "../utils/get-products-from-metadata";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<ClientOrder> => {
  const orderAlreadyExists = await checkIfOrderExists(sessionResult.id);

  if (orderAlreadyExists) {
    throw errors.ORDER_ALREADY_EXISTS();
  }
  const [{ addressId }] = await insertAddress({
    ...validateStripeAddress(sessionResult.customer_details?.address),
  });

  const payment = getPaymentFromSessionResult(sessionResult);

  const paymentExists = Boolean(await getPaymentById(payment.paymentId));

  if (!paymentExists) {
    await insertPaymentReturningId(payment);
  }

  const {
    userId,
    products: productsString,
    cartId,
    clientOrderId,
  } = sessionResult.metadata ?? {};

  const [{ orderId }] = await insertOrder({
    addressId,
    paymentId: payment.paymentId,
    userId,
    orderId: sessionResult.id,
    clientOrderId,
  });

  await insertProductsToOrder(productsString, orderId);

  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Unable to create order");
  }

  if (cartId) {
    await emptyCart(cartId);
  }

  if (userId) {
    await incrementUserVersion(userId);
  }

  return toClientOrder(order);
};

const insertProductsToOrder = async (
  productsString: string,
  orderId: string,
): Promise<void> => {
  if (productsString && orderId) {
    const products = getProductsFromMetadata(productsString);

    products.length && (await addToOrder(products, orderId));
  }
};
