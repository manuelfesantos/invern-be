import { stripe } from "../stripe-client";
import { LineItem } from "@product-entity";
import { Stripe } from "stripe";
import { getRandomUUID } from "@crypto-utils";
import Response = Stripe.Response;
import { getFutureDate, SESSION_EXPIRY } from "@timer-utils";
import { frontendHost, getStripeEnv } from "@http-utils";
import { contextStore } from "@context-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { ShippingMethod } from "@shipping-entity";
import { errors } from "@error-handling-utils";

const FIRST_RATE = 0;

export const createStripeCheckoutSession = async (
  lineItems: LineItem[],
  shippingMethod: ShippingMethod,
  origin?: string,
): Promise<Response<Stripe.Checkout.Session>> => {
  const { country } = contextStore.context;
  const clientId = getRandomUUID();
  const shippingRate = shippingMethod.rates[FIRST_RATE];

  if (!shippingRate) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  const checkoutSession: Stripe.Checkout.SessionCreateParams = {
    cancel_url: `${origin || frontendHost()}/${country.code.toLowerCase()}/cart`,
    expires_at: getFutureDate(SESSION_EXPIRY),

    line_items: lineItems.map((product) => {
      return {
        price_data: {
          currency: country.currency.stripeName,
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
    mode: "payment",
    payment_intent_data: {
      metadata: {
        stripeEnv: getStripeEnv(),
      },
    },
    payment_method_types: ["paypal", "card"],
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            currency: country.currency.stripeName,
            amount: shippingRate.priceInCents,
          },
          display_name: shippingMethod.name,
          delivery_estimate: {
            minimum: {
              unit: "day",
              value: shippingRate.deliveryTime,
            },
            maximum: {
              unit: "day",
              value: shippingRate.deliveryTime,
            },
          },
        },
      },
    ],
    success_url: `${origin || frontendHost()}/${country.code.toLowerCase()}/order/${clientId}?ignoreCheckoutCookie=true`,
  };

  logger().info("Creating checkout session", {
    useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    data: checkoutSession,
  });

  return await stripe().checkout.sessions.create(checkoutSession);
};
