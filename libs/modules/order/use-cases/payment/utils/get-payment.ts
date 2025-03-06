import { PaymentIntent, StripeSessionResult } from "@stripe-entity";
import {
  InsertPayment,
  PaymentIntentState,
  PaymentIntentStateType,
  PaymentMethod,
  PaymentMethodType,
  paymentMethodTypeSchema,
} from "@payment-entity";
import { errors } from "@error-handling-utils";
import Stripe from "stripe";
import { getPaymentMethod } from "@stripe-adapter";

const VALUE_ZERO = 0;

export const getPaymentFromSessionResult = (
  sessionResult: StripeSessionResult,
): { payment: InsertPayment } => {
  const payment: InsertPayment = {
    id: validatePaymentIntent(sessionResult.payment_intent),
    grossAmount: validateAmount(sessionResult.amount_total),
    netAmount: validateAmount(sessionResult.amount_subtotal),
    state: PaymentIntentState.draft,
  };

  return { payment };
};

export const getPaymentFromPaymentIntent = async (
  paymentIntent: PaymentIntent,
  type: PaymentIntentStateType,
): Promise<{ payment: InsertPayment; paymentMethod?: PaymentMethod }> => {
  const [paymentMethodType] = paymentIntent.payment_method_types;

  const paymentMethodId =
    typeof paymentIntent.payment_method === "string"
      ? paymentIntent.payment_method
      : paymentIntent.payment_method?.id;

  const payment: InsertPayment = {
    id: validatePaymentIntent(paymentIntent),
    grossAmount: validateAmount(paymentIntent.amount),
    state: type,
    paymentMethodId,
  };

  if (!paymentMethodId) {
    return { payment };
  }

  const paymentMethod: PaymentMethod = {
    id: paymentMethodId,
    type: paymentMethodTypeSchema.parse(paymentMethodType),
  };

  if (paymentMethod.type !== PaymentMethodType.card) {
    return { payment, paymentMethod };
  }

  const stripePaymentMethod = await getPaymentMethod(paymentMethodId);

  paymentMethod.brand = stripePaymentMethod.card?.brand;
  paymentMethod.last4 = stripePaymentMethod.card?.last4;

  return { payment, paymentMethod };
};

const validatePaymentIntent = (
  paymentIntent: string | Stripe.PaymentIntent | null,
): string => {
  if (paymentIntent && typeof paymentIntent === "string") {
    return paymentIntent;
  } else if (
    paymentIntent &&
    typeof paymentIntent === "object" &&
    paymentIntent.id
  ) {
    return paymentIntent.id;
  } else {
    throw errors.INVALID_PAYMENT("payment_intent is required");
  }
};

const validateAmount = (amount: number | null): number => {
  if (amount && amount > VALUE_ZERO) {
    return amount;
  } else {
    throw errors.INVALID_PAYMENT("amount is either missing or invalid");
  }
};
