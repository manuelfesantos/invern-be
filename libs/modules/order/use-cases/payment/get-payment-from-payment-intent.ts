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
import { getOrderProductsByPaymentId, updateOrder } from "@order-db";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

export const getPaymentFromPaymentIntentSucceededEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const payment = getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.succeeded,
  );
  const { id } = (await getPaymentById(payment.id)) ?? {};

  logger().info("Processing PaymentIntentSucceeded Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      id,
    },
  });

  if (id) {
    const [updatedPayment] = await updatePayment(id, payment);
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
  const savedPayment = await getPaymentById(payment.id);

  logger().info("Processing PaymentIntentCreated Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  if (savedPayment) {
    if (savedPayment?.state !== PaymentIntentState.draft) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await updatePayment(payment.id, payment);
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

  const savedPayment = await getPaymentById(payment.id);

  logger().info("Processing PaymentIntentProcessing Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  if (savedPayment) {
    if (
      savedPayment?.state !== PaymentIntentState.draft &&
      savedPayment?.state !== PaymentIntentState.created
    ) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await updatePayment(payment.id, payment);
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
  const { products, id } =
    (await getOrderProductsByPaymentId(payment.id)) ?? {};

  if (products && products.length && id) {
    const updatedProducts = await increaseProductsStock(products);
    for (const product of updatedProducts) {
      await stockClient.update(product);
    }
    await updateOrder(id, { isCanceled: true });
  }
  const savedPayment = await getPaymentById(payment.id);

  logger().info("Processing Failed Payment Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  if (savedPayment) {
    if (
      savedPayment?.state === PaymentIntentState.succeeded ||
      savedPayment?.state === PaymentIntentState.canceled ||
      savedPayment?.state === PaymentIntentState.failed
    ) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await updatePayment(payment.id, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);
  return insertedPayment;
};
