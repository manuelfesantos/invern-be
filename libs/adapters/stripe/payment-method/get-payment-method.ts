import Stripe from "stripe";
import { stripe } from "../stripe-client";

export const getPaymentMethod = async (
  paymentMethodId: string,
): Promise<Stripe.PaymentMethod> => {
  return await stripe().paymentMethods.retrieve(paymentMethodId);
};
