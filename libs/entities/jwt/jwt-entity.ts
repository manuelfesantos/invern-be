import * as z from "zod";

export const jwtSchema = z.object({
  iat: z.int().nonnegative(),
  exp: z.int().nonnegative().optional(),
});

export const userJwtSchema = jwtSchema.extend({
  userId: z.uuidv4(),
  cartId: z.uuidv4().optional(),
});

export type UserJWT = z.infer<typeof userJwtSchema>;

export type JWT = z.infer<typeof jwtSchema>;
