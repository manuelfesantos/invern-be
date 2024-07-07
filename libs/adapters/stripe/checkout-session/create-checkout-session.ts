import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import Response = Stripe.Response;

export const createCheckoutSession = async (
  lineItems: LineItem[],
  userId: string | null,
  cartId: string | null,
): Promise<Response<Stripe.Checkout.Session>> => {
  return await stripe().checkout.sessions.create({
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
    success_url: "https://www.invernspirit.com/",
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
      products: JSON.stringify(
        lineItems.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      ),
    },
  });
};
