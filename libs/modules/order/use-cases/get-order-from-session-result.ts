import { StripeSessionResult } from "@stripe-entity";
import {
  addToOrder,
  checkIfOrderExists,
  getOrderById,
  insertOrder,
} from "@order-db";
import {
  getPaymentById,
  insertPaymentReturningId,
  updatePayment,
} from "@payment-db";
import { getPaymentFromSessionResult } from "@payment-entity";
import { ClientOrder, clientOrderSchema } from "@order-entity";
import { errors } from "@error-handling-utils";
import { deleteCart, insertCartReturningAll } from "@cart-db";
import { incrementUserVersion, updateUser } from "@user-db";
import { popCheckoutSessionById } from "@checkout-session-db";
import { getProductsFromString } from "../utils/get-products-from-string";
import { logCredentials, logger } from "@logger-utils";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<ClientOrder> => {
  const orderAlreadyExists = await checkIfOrderExists(sessionResult.id);

  logger().addRedactedData({ orderId: sessionResult.id });

  if (orderAlreadyExists) {
    throw errors.ORDER_ALREADY_EXISTS();
  }

  const payment = getPaymentFromSessionResult(sessionResult);

  const paymentExists = Boolean(await getPaymentById(payment.id));

  if (!paymentExists) {
    await insertPaymentReturningId(payment);
  } else {
    await updatePayment(payment.id, { netAmount: payment.netAmount });
  }

  const { clientId, address } = sessionResult.metadata ?? {};

  const [checkoutSession] = await popCheckoutSessionById(sessionResult.id);

  if (!checkoutSession) {
    throw new Error("Checkout session not found");
  }

  const { products: productsString, userId, cartId } = checkoutSession;

  logCredentials(cartId, userId);

  if (!productsString) {
    throw new Error("No products found in checkout session");
  }

  const [{ orderId }] = await insertOrder({
    address,
    paymentId: payment.id,
    userId: userId ?? null,
    id: clientId,
    stripeId: sessionResult.id,
    snapshot: null,
  });

  await insertProductsToOrder(productsString, orderId);

  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Unable to create order");
  }

  if (cartId) {
    await deleteCart(cartId);
    if (userId) {
      const { id: newCartId } = await insertCartReturningAll({
        isLoggedIn: true,
      });
      await updateUser(userId, { cartId: newCartId });
    }
  }

  if (userId) {
    await incrementUserVersion(userId);
  }

  return clientOrderSchema.parse(order);
};

const insertProductsToOrder = async (
  productsString: string,
  orderId: string,
): Promise<void> => {
  if (orderId) {
    const products = getProductsFromString(productsString);

    products.length && (await addToOrder(products, orderId));
  }
};
