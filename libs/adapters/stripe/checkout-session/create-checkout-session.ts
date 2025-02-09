import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import { getRandomUUID } from "@crypto-utils";
import Response = Stripe.Response;
import { getFutureDate, SESSION_EXPIRY } from "@timer-utils";
import { frontendHost, getStripeEnv } from "@http-utils";
import { contextStore } from "@context-utils";

export const createCheckoutSession = async (
  lineItems: LineItem[],
  origin?: string,
): Promise<Response<Stripe.Checkout.Session>> => {
  const { country, address, userDetails, shippingMethod } =
    contextStore.context;
  const clientId = getRandomUUID();
  return await stripe().checkout.sessions.create({
    expires_at: getFutureDate(SESSION_EXPIRY),
    payment_method_types: ["paypal", "card"],
    mode: "payment",
    payment_intent_data: {
      metadata: {
        stripeEnv: getStripeEnv(),
      },
    },
    success_url: `${origin || frontendHost()}/${country.code.toLowerCase()}order?id=${clientId}`,
    cancel_url: `${origin || frontendHost()}/cart`,

    line_items: lineItems.map((product) => {
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            images: product.images.map((image) => image.url),
          },
          unit_amount: product.priceInCents,
        },
        tax_rates: country.taxes.map((tax) => tax.id),
        quantity: product.quantity,
      };
    }),
    metadata: {
      stripeEnv: getStripeEnv(),
      clientId,
      address: address ?? null,
      userDetails: userDetails ?? null,
      shippingMethod: shippingMethod ?? null,
    },
  });
};
