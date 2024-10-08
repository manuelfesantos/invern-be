import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import { getRandomUUID } from "@crypto-utils";
import Response = Stripe.Response;
import { getFutureDate, SESSION_EXPIRY } from "@timer-utils";
import { frontendHost } from "@http-utils";

export const createCheckoutSession = async (
  lineItems: LineItem[],
): Promise<Response<Stripe.Checkout.Session>> => {
  const clientOrderId = getRandomUUID();
  return await stripe().checkout.sessions.create({
    customer_creation: "always",
    expires_at: getFutureDate(SESSION_EXPIRY),
    shipping_address_collection: {
      allowed_countries: [
        "PT",
        "ES",
        "FR",
        "IT",
        "GB",
        "DE",
        "NL",
        "BE",
        "CH",
        "CA",
        "SZ",
        "AT",
      ],
    },
    billing_address_collection: "auto",
    payment_method_types: ["paypal", "card"],
    mode: "payment",
    success_url: `${frontendHost()}/order?id=${clientOrderId}`,
    cancel_url: `${frontendHost()}/cart`,
    line_items: lineItems.map((product) => {
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.productName,
            images: product.images.map((image) => image.url),
          },
          unit_amount: product.priceInCents,
        },
        quantity: product.quantity,
      };
    }),
    metadata: {
      clientOrderId,
    },
  });
};
