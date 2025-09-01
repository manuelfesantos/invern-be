import { HttpMethodEnum } from "@http-entity";
import type Stripe from "stripe";
import { logger } from "@logger-utils";
import { errors } from "@error-handling-utils";
import { ENV } from "@env-utils";

const QUERY_INDEX = 1;

export const getBodyFromRequest = async (
  request: Request,
): Promise<unknown> => {
  try {
    const body =
      request.method === HttpMethodEnum.POST ||
      request.method === HttpMethodEnum.PUT ||
      request.method === HttpMethodEnum.PATCH
        ? await request.json()
        : undefined;

    logger().addRedactedData({ "request.body": body });

    return body;
  } catch (error) {
    if (error instanceof Error) {
      throw errors.UNABLE_TO_PARSE_BODY();
    }
  }
};

export const getQueryFromUrl = (url: string): URLSearchParams | null => {
  const query = url.split("?")[QUERY_INDEX];
  return query ? new URLSearchParams(query) : null;
};

export const isLocalEnv = (): boolean => {
  return ENV.ENV === "local";
};

export const isStripeEnvValid = (
  stripeEvent: Stripe.Checkout.Session | Stripe.PaymentIntent,
): boolean => {
  const { metadata } = stripeEvent;

  const { stripeEnv } = metadata || {};

  return Boolean(stripeEnv && stripeEnv === ENV.STRIPE_ENV);
};
