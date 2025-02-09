import { z } from "zod";
import { positiveIntegerSchema, uuidSchema } from "@global-entity";

export const jwtSchema = z.object({
  iat: positiveIntegerSchema("iat"),
  exp: z.optional(positiveIntegerSchema("exp")),
});

export const userJwtSchema = jwtSchema.extend({
  userId: uuidSchema("user id"),
  cartId: z.optional(uuidSchema("cart id")),
});

export type UserJWT = z.infer<typeof userJwtSchema>;

export type JWT = z.infer<typeof jwtSchema>;
