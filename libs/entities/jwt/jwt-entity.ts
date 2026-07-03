import * as z from "zod";
import { rolesSchema } from "@user-entity";

export const jwtSchema = z.object({
  iat: z.int().nonnegative(),
  exp: z.int().nonnegative().optional(),
});

export const userJwtSchema = jwtSchema.extend({
  userId: z.uuidv4(),
  cartId: z.uuidv4().optional(),
  // Optional during rollout: tokens issued before this claim existed still
  // parse. A missing role is treated as USER at the authorization check.
  role: rolesSchema.optional(),
});

export type UserJWT = z.infer<typeof userJwtSchema>;

export type JWT = z.infer<typeof jwtSchema>;
