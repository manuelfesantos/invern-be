import { PaymentIntent } from "@stripe-entity";
import {
  InsertPayment,
  Payment,
  PaymentIntentState,
  PaymentMethod,
} from "@payment-entity";
import {
  selectPaymentById,
  insertPaymentReturningAll,
  updatePayment,
} from "@payment-db";
import { errors } from "@error-handling-utils";
import { selectOrderProductsByPaymentId, updateOrder } from "@order-db";
import { increaseProductsStock } from "@product-db";
import { stockClient } from "@r2-adapter";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { getPaymentFromPaymentIntent } from "./utils/get-payment";
import {
  insertPaymentMethod,
  selectPaymentMethodById,
} from "@payment-method-db";

export const getPaymentFromPaymentIntentSucceededEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.succeeded,
  );
  const { id } = (await selectPaymentById(payment.id)) ?? {};

  logger().info("Processing PaymentIntentSucceeded Event", {
    useCase: LoggerUseCaseEnum.GET_PAYMENT_INTENT,
    data: {
      payment,
      id,
    },
  });

  await savePaymentMethod(paymentMethod);

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
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.created,
  );
  const savedPayment = await selectPaymentById(payment.id);

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
    const [updatedPayment] = await updatePayment(payment.id, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);

  return insertedPayment;
};

export const getPaymentFromPaymentIntentProcessingEvent = async (
  paymentIntent: PaymentIntent,
): Promise<Payment> => {
  const { payment, paymentMethod } = await getPaymentFromPaymentIntent(
    paymentIntent,
    PaymentIntentState.processing,
  );

  const savedPayment = await selectPaymentById(payment.id);

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
    const [updatedPayment] = await updatePayment(payment.id, payment);
    return updatedPayment;
  }
  const [insertedPayment] = await insertPaymentReturningAll(payment);
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
  const { products, id } =
    (await selectOrderProductsByPaymentId(payment.id)) ?? {};

  if (products && products.length && id) {
    const updatedProducts = await increaseProductsStock(products);
    for (const product of updatedProducts) {
      await stockClient.update(product);
    }
    await updateOrder(id, { isCanceled: true });
  }
  const savedPayment = await selectPaymentById(payment.id);

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

const savePaymentMethod = async (
  paymentMethod?: PaymentMethod,
): Promise<void> => {
  if (!paymentMethod) {
    return;
  }
  const paymentMethodFromDb = await selectPaymentMethodById(paymentMethod.id);
  if (!paymentMethodFromDb) {
    await insertPaymentMethod(paymentMethod);
  }
};
