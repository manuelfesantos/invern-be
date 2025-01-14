import { HttpMethodEnum } from "@http-entity";
import Stripe from "stripe";

const QUERY_INDEX = 1;

export const getBodyFromRequest = async (
  request: Request,
): Promise<unknown> => {
  try {
    return request.method === HttpMethodEnum.POST ||
      request.method === HttpMethodEnum.PUT
      ? request.json()
      : undefined;
  } catch (error) {
    if (error instanceof Error) {
      throw {
        ...error,
        cause: "UNABLE_TO_PARSE_BODY",
      };
    }
  }
};

export const getQueryFromUrl = (url: string): URLSearchParams | null => {
  const query = url.split("?")[QUERY_INDEX];
  return query ? new URLSearchParams(query) : null;
};

let feHost: string;
let stHost: string;
let ctHost: string;
let stripeEnv: string;
let env: string;

export const setHosts = (
  frontendHost: string,
  stockHost: string,
  countriesHost: string,
): void => {
  if (!feHost) {
    feHost = frontendHost;
  }

  if (!stHost) {
    stHost = stockHost;
  }

  if (!ctHost) {
    ctHost = countriesHost;
  }
};

export const frontendHost = (): string => {
  return feHost || "";
};

export const stockHost = (): string => {
  return stHost || "";
};

export const countriesHost = (): string => {
  return ctHost || "";
};

export const setStripeEnv = (newStripeEnv: string): void => {
  stripeEnv = newStripeEnv;
};

export const getStripeEnv = (): string => {
  if (!stripeEnv) {
    throw new Error("Stripe Environment variable not setup!");
  }
  return stripeEnv;
};

export const setEnv = (newEnv: string): void => {
  env = newEnv;
};

export const getEnv = (): string => {
  if (!env) {
    throw new Error("Env is not defined!");
  }
  return env;
};

export const isLocalEnv = (): boolean => {
  if (!env) {
    throw new Error("Env is not defined!");
  }
  return env === "local";
};

export const isStripeEnvValid = (
  stripeEvent: Stripe.Checkout.Session | Stripe.PaymentIntent,
): boolean => {
  const { metadata } = stripeEvent;

  const { stripeEnv } = metadata || {};

  return Boolean(stripeEnv && stripeEnv === getStripeEnv());
};
