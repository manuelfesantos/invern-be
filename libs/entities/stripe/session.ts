import Stripe from "stripe";
import Response = Stripe.Response;
import { isStripeEvent } from "./event";

export type StripeSessionCompletedEvent = Stripe.CheckoutSessionCompletedEvent;
export type StripeSessionExpiredEvent = Stripe.CheckoutSessionExpiredEvent;

export type StripeSessionResult = StripeSessionCompletedEvent["data"]["object"];
export type StripeCustomerDetails = StripeSessionResult["customer_details"];

export type StripeCheckoutSessionResponse = Response<Stripe.Checkout.Session>;
export const isStripeSessionCompletedEvent = (
  value: unknown,
): value is StripeSessionCompletedEvent => {
  return isStripeEvent(value) && value.type === "checkout.session.completed";
};

export const isStripeSessionExpiredEvent = (
  value: unknown,
): value is StripeSessionExpiredEvent => {
  return isStripeEvent(value) && value.type === "checkout.session.expired";
};
