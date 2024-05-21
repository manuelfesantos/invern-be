import { getStripeClient } from "../stripe-client";
import { ProductWithQuantity } from "@product-entity";
import { Stripe } from "stripe";
import Response = Stripe.Response;

export const createCheckoutSession = async (
  products: ProductWithQuantity[],
): Promise<Response<Stripe.Checkout.Session>> => {
  const stripe = getStripeClient();
  return await stripe.checkout.sessions.create({
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
    success_url: "https://www.invernspirit.com",
    cancel_url: "https://www.invernspirit.com/cart",
    line_items: products.map((product) => {
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.productName,
            images: product.productImage ? [product.productImage.imageUrl] : [],
          },
          unit_amount: product.price,
        },
        quantity: product.quantity,
      };
    }),
  });
};
