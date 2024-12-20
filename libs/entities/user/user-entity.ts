import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "@schema";
import { z } from "zod";
import { cartDTOSchema, cartSchema } from "@cart-entity";
import { emailSchema, requiredStringSchema, uuidSchema } from "@global-entity";

export const DEFAULT_USER_VERSION = 1;

export const baseUserSchema = createInsertSchema(usersTable, {
  id: uuidSchema("user id"),
  password: requiredStringSchema("user password"),
  version: z.number().default(DEFAULT_USER_VERSION),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  email: emailSchema("user mail"),
  firstName: requiredStringSchema("user first name"),
  lastName: requiredStringSchema("user last name"),
});

export const insertUserSchema = baseUserSchema.omit({
  id: true,
  version: true,
  role: true,
});

export const userSchema = baseUserSchema
  .omit({
    cartId: true,
  })
  .merge(
    z.object({
      cart: cartSchema.nullable(),
    }),
  );

export const userDTOSchema = userSchema
  .omit({
    password: true,
    role: true,
    id: true,
  })
  .transform((payload) => ({
    ...payload,
    cart: payload.cart ? cartDTOSchema.parse(payload.cart) : null,
  }));

export const userToUserDTO = (user: User): UserDTO => {
  return userDTOSchema.parse(user);
};

export type User = z.infer<typeof userSchema>;
export type UserDTO = z.infer<typeof userDTOSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
