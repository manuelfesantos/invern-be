import { StripeSessionResult } from "@stripe-entity";
import { insertAddress } from "@address-db";
import { validateStripeAddress } from "@address-entity";
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
import { emptyCart } from "@cart-db";
import { incrementUserVersion } from "@user-db";
import { popCheckoutSessionById } from "@checkout-session-db";
import { getProductsFromString } from "../utils/get-products-from-string";
import { logger } from "@logger-utils";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<ClientOrder> => {
  const orderAlreadyExists = await checkIfOrderExists(sessionResult.id);

  logger().addData({ orderId: sessionResult.id });

  if (orderAlreadyExists) {
    throw errors.ORDER_ALREADY_EXISTS();
  }

  const [{ addressId }] = await insertAddress(
    validateStripeAddress(sessionResult.customer_details?.address),
  );

  const payment = getPaymentFromSessionResult(sessionResult);

  const paymentExists = Boolean(await getPaymentById(payment.id));

  if (!paymentExists) {
    await insertPaymentReturningId(payment);
  } else {
    await updatePayment(payment.id, { netAmount: payment.netAmount });
  }

  const { clientId } = sessionResult.metadata ?? {};

  const [checkoutSession] = await popCheckoutSessionById(sessionResult.id);

  if (!checkoutSession) {
    throw new Error("Checkout session not found");
  }

  const { products: productsString, userId, cartId } = checkoutSession;

  if (!productsString) {
    throw new Error("No products found in checkout session");
  }

  const [{ orderId }] = await insertOrder({
    addressId,
    paymentId: payment.id,
    userId: userId ?? null,
    id: sessionResult.id,
    clientId,
    snapshot: null,
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
