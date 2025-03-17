import Stripe from "stripe";
import { ENV } from "@env-utils";

let stripeClient: Stripe | null = null;

export const stripe = (): Stripe => {
  if (!stripeClient) {
    stripeClient = new Stripe(ENV.STRIPE_API_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripeClient;
};
