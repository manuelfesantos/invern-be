import Stripe from "stripe";

export type StripeSessionCompletedEvent = Stripe.CheckoutSessionCompletedEvent;

export type StripeSessionResult = StripeSessionCompletedEvent["data"]["object"];
export type StripeCustomerDetails = StripeSessionResult["customer_details"];
export const isStripeSessionCompletedEvent = (
  value: unknown,
): value is StripeSessionCompletedEvent => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "type" in value &&
    typeof value.type === "string" &&
    value.type === "checkout.session.completed" &&
    "data" in value &&
    typeof value.data === "object" &&
    value.data !== null
  );
};
