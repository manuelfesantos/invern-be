import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "@schema";
import { z } from "zod";
import { cartSchema } from "@cart-entity";
import { emailSchema, requiredStringSchema, uuidSchema } from "@global-entity";
import { addressSchema } from "@address-entity";

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
  .extend({
    cart: cartSchema.nullable(),
    address: addressSchema.nullable(),
  });

export const userDTOSchema = userSchema.omit({
  password: true,
  role: true,
  id: true,
  cart: true,
});

export const userToUserDTO = (user: User): UserDTO => {
  return userDTOSchema.parse(user);
};

export type User = z.infer<typeof userSchema>;
export type UserDTO = z.infer<typeof userDTOSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
