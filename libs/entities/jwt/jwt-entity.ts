import { z } from "zod";

export const jwtSchema = z.object({
  iat: z.number(),
  exp: z.number().optional(),
});

export const userJwtSchema = jwtSchema.extend({
  userId: z.string(),
  cartId: z.string().optional(),
});

export type UserJWT = z.infer<typeof userJwtSchema>;

export type JWT = z.infer<typeof jwtSchema>;
