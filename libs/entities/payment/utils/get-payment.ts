import { PaymentIntent, StripeSessionResult } from "@stripe-entity";
import {
  InsertPayment,
  PaymentIntentState,
  PaymentIntentStateType,
  PaymentMethodType,
  paymentMethodTypeSchema,
} from "@payment-entity";
import { errors } from "@error-handling-utils";
import Stripe from "stripe";

const VALUE_ZERO = 0;

export const getPaymentFromSessionResult = (
  sessionResult: StripeSessionResult,
): InsertPayment => {
  return {
    id: validatePaymentIntent(sessionResult.payment_intent),
    type: PaymentMethodType.draft,
    grossAmount: validateAmount(sessionResult.amount_total),
    netAmount: validateAmount(sessionResult.amount_subtotal),
    state: PaymentIntentState.draft,
  };
};

export const getPaymentFromPaymentIntent = (
  paymentIntent: PaymentIntent,
  type: PaymentIntentStateType,
): InsertPayment => {
  const [paymentMethodType] = paymentIntent.payment_method_types;
  return {
    id: validatePaymentIntent(paymentIntent),
    type: paymentMethodTypeSchema.parse(paymentMethodType),
    grossAmount: validateAmount(paymentIntent.amount),
    state: type,
  };
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
