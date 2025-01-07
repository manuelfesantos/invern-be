import { HttpMethodEnum } from "@http-entity";
import Stripe from "stripe";

const QUERY_INDEX = 1;

export const getBodyFromRequest = async (
  request: Request,
): Promise<unknown> => {
  return request.method === HttpMethodEnum.POST ||
    request.method === HttpMethodEnum.PUT
    ? request.json()
    : undefined;
};

export const getQueryFromUrl = (url: string): URLSearchParams | null => {
  const query = url.split("?")[QUERY_INDEX];
  return query ? new URLSearchParams(query) : null;
};

let feHost: string;
let stHost: string;
let ctHost: string;
let stripeEnv: string;

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

export const isStripeEnvValid = (
  stripeEvent: Stripe.Checkout.Session | Stripe.PaymentIntent,
): boolean => {
  const { metadata } = stripeEvent;

  const { stripeEnv } = metadata || {};

  return Boolean(stripeEnv && stripeEnv === getStripeEnv());
};
