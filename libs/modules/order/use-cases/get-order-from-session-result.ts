import type { StripeSessionResult } from "@stripe-entity";
import { getSelectOrdersByIdAction, getInsertOrderAction } from "@order-db";
import {
  getSelectPaymentByIdAction,
  getInsertPaymentReturningIdAction,
  getUpdatePaymentAction,
} from "@payment-db";
import type { InsertPayment } from "@payment-entity";
import type {
  BaseOrder,
  ClientOrder} from "@order-entity";
import {
  clientOrderSchema,
  insertOrderSchema,
} from "@order-entity";
import { errors } from "@error-handling-utils";
import { getDeleteCartAction, getInsertCartAction } from "@cart-db";
import { getIncrementUserVersionAction, getUpdateUserAction } from "@user-db";
import {
  getDeleteCheckoutSessionByIdAction,
  getSelectCheckoutSessionByIdAction,
} from "@checkout-session-db";
import { logCredentials, logger } from "@logger-utils";
import { getInsertShippingTransactionAction } from "@shipping-transaction-db";
import { ShippingTransactionStatusEnum } from "@shipping-transaction-entity";
import { getDateTime } from "@timer-utils";
import type { CheckoutSession } from "@checkout-session-entity";
import { getPaymentFromSessionResult } from "./payment/utils/get-payment";
import { sendCheckoutSuccessfulEmail } from "@sendgrid-adapter";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stringifyObject } from "@string-utils";
import { getRandomUUID } from "@crypto-utils";
import { runBatchOperation } from "@generics-db";
import { withRetry } from "./payment/utils/retry-payment";

export const getOrderFromSessionResult = async (
  sessionResult: StripeSessionResult,
): Promise<ClientOrder> => {
  logger().addRedactedData({ orderId: sessionResult.id });

  const { payment: checkoutSessionPayment, checkoutSession } =
    await getCheckoutData(sessionResult.id, sessionResult);

  const payment = await getPayment(checkoutSessionPayment);

  const {
    products,
    userId,
    cartId,
    address,
    personalDetails,
    shippingMethod,
    country,
    orderId,
  } = checkoutSession;

  logCredentials(cartId, userId);

  const shippingTransactionId = getRandomUUID();

  const insertShippingTransactionAction = getInsertShippingTransactionAction({
    status: ShippingTransactionStatusEnum.processing,
    id: shippingTransactionId,
  });

  const newOrder: BaseOrder = {
    personalDetails,
    shippingMethod,
    country,
    shippingTransactionId,
    createdAt: getDateTime(),
    lastModifiedAt: getDateTime(),
    id: orderId,
    address,
    products,
    userId: userId ?? null,
    stripeId: sessionResult.id,
    paymentId: payment.id,
    isCanceled: false,
  };

  const insertOrderAction = getInsertOrderAction(
    insertOrderSchema.parse(newOrder),
  );

  const selectOrdersByIdAction = getSelectOrdersByIdAction(orderId);

  let deleteCartAction: ReturnType<typeof getDeleteCartAction> | undefined =
    undefined;
  let insertCartAction: ReturnType<typeof getInsertCartAction> | undefined =
    undefined;
  let updateUserAction: ReturnType<typeof getUpdateUserAction> | undefined =
    undefined;
  let incrementUserVersionAction:
    | ReturnType<typeof getIncrementUserVersionAction>
    | undefined = undefined;
  if (cartId) {
    deleteCartAction = getDeleteCartAction(cartId);
    if (userId) {
      const newCartId = getRandomUUID();
      insertCartAction = getInsertCartAction({
        isLoggedIn: true,
        id: newCartId,
      });
      updateUserAction = getUpdateUserAction(userId, { cartId: newCartId });
      logCredentials(newCartId);
    }
  }

  if (userId) {
    incrementUserVersionAction = getIncrementUserVersionAction(userId);
  }

  const deleteCheckoutSessionByIdAction = getDeleteCheckoutSessionByIdAction(
    sessionResult.id,
  );

  const [, , [order]] = await runBatchOperation(
    insertShippingTransactionAction,
    insertOrderAction,
    selectOrdersByIdAction,
    deleteCartAction,
    insertCartAction,
    updateUserAction,
    incrementUserVersionAction,
    deleteCheckoutSessionByIdAction,
  );

  if (!order) {
    throw new Error("Unable to create order");
  }

  const clientOrder = clientOrderSchema.parse(order);

  logger().info("Finished creating order after checkout session result", {
    useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
    data: { createdOrder: stringifyObject(clientOrder) },
  });

  if (!personalDetails.email) {
    logger().warn("Email not found in personal details", {
      useCase: LoggerUseCaseEnum.HANDLE_CHECKOUT_SESSION,
      data: { personalDetails: stringifyObject(personalDetails) },
    });
    return clientOrder;
  }

  await sendCheckoutSuccessfulEmail(order);

  return clientOrder;
};

const getCheckoutData = async (
  sessionId: string,
  sessionResult: StripeSessionResult,
): Promise<{
  payment: InsertPayment;
  checkoutSession: CheckoutSession;
}> => {
  const { payment: paymentFromSessionResult } =
    getPaymentFromSessionResult(sessionResult);

  const selectCheckoutSessionByIdAction =
    getSelectCheckoutSessionByIdAction(sessionId);

  const selectOrdersByIdAction = getSelectOrdersByIdAction(sessionId);

  const [checkoutSession, [order]] = await runBatchOperation(
    selectCheckoutSessionByIdAction,
    selectOrdersByIdAction,
  );

  if (order) {
    throw errors.ORDER_ALREADY_EXISTS();
  }

  if (!checkoutSession) {
    throw new Error("Checkout session not found");
  }

  return {
    checkoutSession,
    payment: paymentFromSessionResult,
  };
};

const getPayment = async (payment: InsertPayment): Promise<InsertPayment> => {
  return withRetry(payment, async (payment: InsertPayment) => {
    const paymentExists = Boolean(
      await getSelectPaymentByIdAction(payment.id).run(),
    );
    if (!paymentExists) {
      await getInsertPaymentReturningIdAction(payment).run();
    } else {
      await getUpdatePaymentAction(payment.id, {
        netAmount: payment.netAmount,
      }).run();
    }

    return payment;
  });
};
