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
