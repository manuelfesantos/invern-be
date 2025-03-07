import { z } from "zod";
import { PagesFunction } from "@cloudflare/workers-types";
import { Env } from "@request-entity";

export const httpMethodsSchema = z.enum(
  ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  {
    message: "Invalid HTTP method",
  },
);
export const HttpMethodEnum = httpMethodsSchema.enum;
export type HttpMethod = (typeof HttpMethodEnum)[keyof typeof HttpMethodEnum];

export const HttpHeaderEnum = {
  ACTION: "action",
  CART_ID: "cartId",
  COOKIE: "Cookie",
} as const;
export type HttpHeader = (typeof HttpHeaderEnum)[keyof typeof HttpHeaderEnum];

export type HttpParams = string | string[];

export const CookieNameEnum = {
  CART_ID: "c_i",
  REFRESH_TOKEN: "s_r",
  CHECKOUT_SESSION: "c_s",
  REMEMBER: "r_m",
  ADDRESS: "a_d",
  USER_DETAILS: "u_d",
  SHIPPING_METHOD: "s_m",
} as const;

export type CookieName = (typeof CookieNameEnum)[keyof typeof CookieNameEnum];

export type Data = Record<string, unknown>;

export type HandlerMethodMapper<T extends Data> = Partial<
  Record<keyof typeof HttpMethodEnum, PagesFunction<Env, string, T>>
>;
