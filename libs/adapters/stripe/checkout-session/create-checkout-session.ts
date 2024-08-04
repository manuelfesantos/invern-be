import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import Response = Stripe.Response;
import { getRandomUUID } from "@crypto-utils";

export const createCheckoutSession = async (
  lineItems: LineItem[],
  userId: string | null,
  cartId: string | null,
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
    success_url: `https://www.invernspirit.com/order/${clientOrderId}`,
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
      userId,
      cartId,
      clientOrderId,
      products: JSON.stringify(
        lineItems.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      ),
    },
  });
};
