import type { PaymentIntent } from "@stripe-entity";
import type {
  InsertPayment,
  InsertPaymentMethod,
  Payment} from "@payment-entity";
import {
  PaymentIntentState,
} from "@payment-entity";
import {
  getSelectPaymentByIdAction,
  getInsertPaymentReturningAllAction,
  getUpdatePaymentAction,
} from "@payment-db";
import { errors } from "@error-handling-utils";
import {
  getSelectOrderProductsByPaymentIdAction,
  getUpdateOrderAction,
} from "@order-db";
import { getIncreaseProductsStockAction } from "@product-db";
import { stockClient } from "@r2-adapter";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { getPaymentFromPaymentIntent } from "./utils/get-payment";
import {
  getInsertPaymentMethodAction,
  getSelectPaymentMethodByIdAction,
} from "@payment-method-db";

export const getPaymentFromPaymentIntentSucceededEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.succeeded,
  );
  const savedPayment = await getSelectPaymentByIdAction(payment.id).run();

  logger().info("Processing PaymentIntentSucceeded Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  await savePaymentMethod(paymentMethod);

  if (savedPayment) {
    // Precedence: a late `succeeded` must not regress an already-terminal
    // (canceled/failed) payment. succeeded→succeeded is an idempotent no-op.
    if (
      savedPayment.state === PaymentIntentState.canceled ||
      savedPayment.state === PaymentIntentState.failed
    ) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await getUpdatePaymentAction(
      savedPayment.id,
      payment,
    ).run();
    return updatedPayment;
  }
  const [insertedPayment] =
    await getInsertPaymentReturningAllAction(payment).run();

  return insertedPayment;
};

export const getPaymentFromPaymentIntentCreatedEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.created,
  );
  const savedPayment = await getSelectPaymentByIdAction(payment.id).run();

  logger().info("Processing PaymentIntentCreated Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  await savePaymentMethod(paymentMethod);

  if (savedPayment) {
    if (savedPayment?.state !== PaymentIntentState.draft) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await getUpdatePaymentAction(
      payment.id,
      payment,
    ).run();
    return updatedPayment;
  }
  const [insertedPayment] =
    await getInsertPaymentReturningAllAction(payment).run();

  return insertedPayment;
};

export const getPaymentFromPaymentIntentProcessingEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.processing,
  );

  const savedPayment = await getSelectPaymentByIdAction(payment.id).run();

  logger().info("Processing PaymentIntentProcessing Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  await savePaymentMethod(paymentMethod);

  if (savedPayment) {
    if (
      savedPayment?.state !== PaymentIntentState.draft &&
      savedPayment?.state !== PaymentIntentState.created
    ) {
      throw errors.PAYMENT_ALREADY_EXISTS();
    }
    const [updatedPayment] = await getUpdatePaymentAction(
      payment.id,
      payment,
    ).run();
    return updatedPayment;
  }
  const [insertedPayment] =
    await getInsertPaymentReturningAllAction(payment).run();
  return insertedPayment;
};

export const getPaymentFromPaymentIntentCanceledEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.canceled,
  );

  await savePaymentMethod(paymentMethod);

  return await handleFailedPayment(payment);
};

export const getPaymentFromPaymentIntentFailedEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.failed,
  );

  await savePaymentMethod(paymentMethod);

  return await handleFailedPayment(payment);
};

const handleFailedPayment = async (
  payment: InsertPayment,
): Promise<Payment> => {
  const savedPayment = await getSelectPaymentByIdAction(payment.id).run();

  logger().info("Processing Failed Payment Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      savedPayment,
    },
  });

  // Idempotency BEFORE the stock release: a replayed canceled/failed (or one
  // arriving after a terminal state) must not release stock a second time.
  if (
    savedPayment &&
    (savedPayment.state === PaymentIntentState.succeeded ||
      savedPayment.state === PaymentIntentState.canceled ||
      savedPayment.state === PaymentIntentState.failed)
  ) {
    throw errors.PAYMENT_ALREADY_EXISTS();
  }

  const [{ products, id }] = await getSelectOrderProductsByPaymentIdAction(
    payment.id,
  ).run();

  if (products && products.length && id) {
    const updatedProducts =
      await getIncreaseProductsStockAction(products).run();

    await stockClient.updateMany(updatedProducts);

    await getUpdateOrderAction(id, { isCanceled: true }).run();
  }

  if (savedPayment) {
    const [updatedPayment] = await getUpdatePaymentAction(
      payment.id,
      payment,
    ).run();
    return updatedPayment;
  }
  const [insertedPayment] =
    await getInsertPaymentReturningAllAction(payment).run();
  return insertedPayment;
};

const savePaymentMethod = async (
  paymentMethod?: InsertPaymentMethod,
): Promise<void> => {
  if (!paymentMethod) {
    return;
  }
  const paymentMethodFromDb = await getSelectPaymentMethodByIdAction(
    paymentMethod.id,
  ).run();
  if (!paymentMethodFromDb) {
    await getInsertPaymentMethodAction(paymentMethod).run();
  }
};
