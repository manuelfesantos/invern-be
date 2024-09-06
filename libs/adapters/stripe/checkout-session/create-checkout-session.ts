import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import { getRandomUUID } from "@crypto-utils";
import Response = Stripe.Response;

const LAST_DIGIT = -1;

export const createCheckoutSession = async (
  lineItems: LineItem[],
  userId?: string,
  cartId?: string,
): Promise<Response<Stripe.Checkout.Session>> => {
  const clientOrderId = getRandomUUID();
  return await stripe().checkout.sessions.create({
    customer_creation: "always",
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
    success_url: `https://www.invernspirit.com/order?id=${clientOrderId}`,
    cancel_url: "https://www.invernspirit.com/cart",
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
      ...(userId && { userId }),
      ...(cartId && { cartId }),
      clientOrderId,
      products: buildLineItemsMetadata(lineItems),
    },
  });
};

const buildLineItemsMetadata = (lineItems: LineItem[]): string => {
  return lineItems
    .reduce((acc, curr) => {
      return acc + `${curr.productId}:${curr.quantity}|`;
    }, "")
    .slice(LAST_DIGIT);
};
