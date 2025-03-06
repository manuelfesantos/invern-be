import { StripeSessionResult } from "@stripe-entity";
import { checkIfOrderExists, selectOrderById, insertOrder } from "@order-db";
import {
  selectPaymentById,
  insertPaymentReturningId,
  updatePayment,
} from "@payment-db";
import { InsertPayment } from "@payment-entity";
import {
  BaseOrder,
  ClientOrder,
  clientOrderSchema,
  insertOrderSchema,
} from "@order-entity";
import { errors } from "@error-handling-utils";
import { deleteCart, insertCartReturningAll } from "@cart-db";
import { incrementUserVersion, updateUser } from "@user-db";
import { popCheckoutSessionById } from "@checkout-session-db";
import { logCredentials, logger } from "@logger-utils";
import { insertShippingTransaction } from "@shipping-transaction-db";
import { ShippingTransactionStatusEnum } from "@shipping-transaction-entity";
import { getDateTime } from "@timer-utils";
import { CheckoutSession } from "@checkout-session-entity";
import { getPaymentFromSessionResult } from "./payment/utils/get-payment";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<ClientOrder> => {
  logger().addRedactedData({ orderId: sessionResult.id });

  await validateIfOrderAlreadyExists(sessionResult.id);

  const payment = await getPayment(sessionResult);

  const {
    products,
    userId,
    cartId,
    address,
    personalDetails,
    shippingMethod,
    country,
    orderId: clientId,
  } = await getCheckoutSession(sessionResult.id);

  logCredentials(cartId, userId);

  const { id: shippingTransactionId } = await insertShippingTransaction({
    status: ShippingTransactionStatusEnum.processing,
  });

  const newOrder: BaseOrder = {
    personalDetails,
    shippingMethod,
    country,
    shippingTransactionId,
    createdAt: getDateTime(),
    id: clientId,
    address,
    products,
    userId: userId ?? null,
    stripeId: sessionResult.id,
    paymentId: payment.id,
    isCanceled: false,
  };

  const [{ orderId }] = await insertOrder(insertOrderSchema.parse(newOrder));

  const order = await selectOrderById(orderId);

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

const validateIfOrderAlreadyExists = async (orderId: string): Promise<void> => {
  const orderAlreadyExists = await checkIfOrderExists(orderId);

  if (orderAlreadyExists) {
    throw errors.ORDER_ALREADY_EXISTS();
  }
};

const getPayment = async (
  sessionResult: StripeSessionResult,
): Promise<InsertPayment> => {
  const { payment } = getPaymentFromSessionResult(sessionResult);

  const paymentExists = Boolean(await selectPaymentById(payment.id));

  if (!paymentExists) {
    await insertPaymentReturningId(payment);
  } else {
    await updatePayment(payment.id, { netAmount: payment.netAmount });
  }

  return payment;
};

const getCheckoutSession = async (
  sessionId: string,
): Promise<CheckoutSession> => {
  const [checkoutSession] = await popCheckoutSessionById(sessionId);

  if (!checkoutSession) {
    throw new Error("Checkout session not found");
  }

  return checkoutSession;
};
