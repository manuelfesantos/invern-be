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
import { productIdAndQuantitySchema } from "@product-entity";
import { emptyCart } from "@cart-db";
import { getUserById, incrementUserVersion } from "@user-db";

const DEFAULT_USER_VERSION = 1;

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
    throw errors.UNABLE_TO_CREATE_ORDER();
  }

  if (cartId) {
    await emptyCart(cartId);
  }

  if (userId) {
    const { version } = await getUserById(userId);
    await incrementUserVersion(userId, version || DEFAULT_USER_VERSION);
  }

  return toClientOrder(order);
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
