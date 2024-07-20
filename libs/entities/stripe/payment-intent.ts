import Stripe from "stripe";

export type PaymentIntent = Stripe.PaymentIntent;

export const isStripePaymentIntent = (
  value: unknown,
): value is PaymentIntent => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "object" in value &&
    value.object === "payment_intent" &&
    "amount" in value &&
    typeof value.amount === "number" &&
    "payment_method_types" in value &&
    Array.isArray(value.payment_method_types)
  );
};
