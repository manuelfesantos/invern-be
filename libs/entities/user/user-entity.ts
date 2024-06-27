import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "@schema";
import { z } from "zod";
import { cartSchema } from "@cart-entity";
import { orderSchema } from "@order-entity";
import { emailSchema, requiredStringSchema, uuidSchema } from "@global-entity";

const DEFAULT_VERSION_VALUE = 1;

export const baseUserSchema = createInsertSchema(usersTable, {
  userId: uuidSchema("user id"),
  password: requiredStringSchema("user password"),
  version: z.number().default(DEFAULT_VERSION_VALUE),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  email: emailSchema("user mail"),
  firstName: requiredStringSchema("user first name"),
  lastName: requiredStringSchema("user last name"),
});

export const insertUserSchema = baseUserSchema.omit({
  userId: true,
  version: true,
  role: true,
  cartId: true,
});

export const userSchema = baseUserSchema
  .omit({
    cartId: true,
  })
  .merge(
    z.object({
      cart: cartSchema.nullable(),
      orders: z.array(orderSchema).nullable(),
    }),
  );

export const userDTOSchema = userSchema.omit({
  password: true,
  role: true,
});

export const userWithoutCartSchema = userSchema.omit({
  cart: true,
});

export const userToUserDTO = (user: User): UserDTO => {
  return userDTOSchema.parse(user);
};

export type User = z.infer<typeof userSchema>;
export type UserDTO = z.infer<typeof userDTOSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
