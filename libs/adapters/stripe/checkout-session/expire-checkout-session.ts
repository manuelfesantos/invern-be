import { stripe } from "../stripe-client";
import type { StripeCheckoutSessionResponse } from "@stripe-entity";

export const expireCheckoutSession = async (
  checkoutSessionId: string,
): Promise<StripeCheckoutSessionResponse> =>
  await stripe().checkout.sessions.expire(checkoutSessionId);
