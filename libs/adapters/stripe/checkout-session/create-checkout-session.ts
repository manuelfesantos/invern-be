import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import { getRandomUUID } from "@crypto-utils";
import Response = Stripe.Response;
import { getFutureDate, SESSION_EXPIRY } from "@timer-utils";
import { frontendHost, getStripeEnv } from "@http-utils";
import { Country } from "@country-entity";

export const createCheckoutSession = async (
  lineItems: LineItem[],
  country: Country,
  origin?: string,
  v2?: boolean,
): Promise<Response<Stripe.Checkout.Session>> => {
  const clientId = getRandomUUID();
  return await stripe().checkout.sessions.create({
    customer_creation: "always",
    expires_at: getFutureDate(SESSION_EXPIRY),
    shipping_address_collection: {
      allowed_countries: [country.code],
    },
    billing_address_collection: "auto",
    payment_method_types: ["paypal", "card"],
    mode: "payment",
    payment_intent_data: {
      metadata: {
        stripeEnv: getStripeEnv(),
      },
    },
    success_url: `${origin || frontendHost()}/${v2 ? `${country.code.toLowerCase()}/` : ""}order?id=${clientId}`,
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
    },
  });
};
