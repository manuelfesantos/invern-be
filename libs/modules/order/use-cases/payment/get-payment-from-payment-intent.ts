import { PaymentIntent } from "@stripe-entity";
import {
  getPaymentFromPaymentIntent,
  InsertPayment,
  Payment,
  PaymentIntentState,
} from "@payment-entity";
import {
  getPaymentById,
  insertPaymentReturningAll,
  updatePayment,
} from "@payment-db";
import { errors } from "@error-handling-utils";
import { getOrderProductsByPaymentId } from "@order-db";
import { increaseProductsStock } from "@product-db";

export const getPaymentFromPaymentIntentSucceededEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const payment = getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.succeeded,
  );
  const { paymentId } = (await getPaymentById(payment.paymentId)) ?? {};
  if (paymentId) {
    const [updatedPayment] = await updatePayment(paymentId, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);
  return insertedPayment;
};

export const getPaymentFromPaymentIntentCreatedEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const payment = getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.created,
  );
  const savedPayment = await getPaymentById(payment.paymentId);
  if (savedPayment) {
    if (savedPayment?.state !== PaymentIntentState.draft) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await updatePayment(payment.paymentId, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);
  return insertedPayment;
};

export const getPaymentFromPaymentIntentProcessingEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const payment = getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.processing,
  );

  const savedPayment = await getPaymentById(payment.paymentId);

  if (savedPayment) {
    if (
      savedPayment?.state !== PaymentIntentState.draft &&
      savedPayment?.state !== PaymentIntentState.created
    ) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await updatePayment(payment.paymentId, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);
  return insertedPayment;
};

export const getPaymentFromPaymentIntentCanceledEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const payment = getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.canceled,
  );
  return await handleFailedPayment(payment);
};

export const getPaymentFromPaymentIntentFailedEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const payment = getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.failed,
  );
  return await handleFailedPayment(payment);
};

const handleFailedPayment = async (
  payment: InsertPayment,
): Promise<Payment> => {
  const products = await getOrderProductsByPaymentId(payment.paymentId);
  if (products.length) {
    await increaseProductsStock(products);
  }
  const savedPayment = await getPaymentById(payment.paymentId);
  if (savedPayment) {
    if (
      savedPayment?.state === PaymentIntentState.succeeded ||
      savedPayment?.state === PaymentIntentState.canceled ||
      savedPayment?.state === PaymentIntentState.failed
    ) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await updatePayment(payment.paymentId, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);
  return insertedPayment;
};
