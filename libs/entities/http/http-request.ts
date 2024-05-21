import { z } from "zod";

export const httpMethodsSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
]);
export const HttpMethodEnum = httpMethodsSchema.enum;
export type HttpMethod = (typeof HttpMethodEnum)[keyof typeof HttpMethodEnum];

export const HttpHeaderEnum = {
  ACTION: "action",
  CART_ID: "cartId",
} as const;
export type HttpHeader = (typeof HttpHeaderEnum)[keyof typeof HttpHeaderEnum];

export type HttpParams = string | string[];
