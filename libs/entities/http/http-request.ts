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
} as const;
export type HttpHeader = (typeof HttpHeaderEnum)[keyof typeof HttpHeaderEnum];

export const getBodyFromRequest = async (
  request: Request,
): Promise<unknown> => {
  return request.method === HttpMethodEnum.POST ||
    request.method === HttpMethodEnum.PUT
    ? request.json()
    : undefined;
};

export type HttpParams = string | string[];

export const getQueryFromUrl = (url: string) => {
  const query = url.split("?")[1];
  return query ? new URLSearchParams(query) : null;
};
