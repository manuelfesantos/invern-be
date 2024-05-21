import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export const initStripeClient = (apiKey: string): void => {
  stripeClient = new Stripe(apiKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });
};

export const getStripeClient = (): Stripe => {
  if (!stripeClient) {
    throw new Error("Stripe client not initialized");
  }
  return stripeClient;
};
