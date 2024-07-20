import Stripe from "stripe";

export type StripeEvent = Stripe.Event;

export const isStripeEvent = (value: unknown): value is StripeEvent => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "type" in value &&
    typeof value.type === "string" &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null
  );
};
