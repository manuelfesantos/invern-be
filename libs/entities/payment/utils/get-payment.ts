import { StripeSessionResult } from "@stripe-entity";
import { InsertPayment } from "@payment-entity";
import { errors } from "@error-handling-utils";
import Stripe from "stripe";

export const getPaymentFromSessionResult = (
  sessionResult: StripeSessionResult,
): InsertPayment => {
  return {
    paymentId: validatePaymentIntent(sessionResult.payment_intent),
    type: "card",
    amount: validateAmount(sessionResult.amount_total),
    state: "pending",
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
  if (amount) {
    return amount;
  } else {
    throw errors.INVALID_PAYMENT("amount is required");
  }
};
