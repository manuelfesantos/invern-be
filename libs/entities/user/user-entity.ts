import { z } from "zod";
import { RolesEnum, rolesSchema } from "./roles";
import { cartSchema } from "@cart-entity";
import { emailSchema, requiredStringSchema, uuidSchema } from "@global-entity";

export const userSchema = z.object({
  userId: uuidSchema("user id"),
  email: emailSchema("user email"),
  firstName: requiredStringSchema("first name"),
  lastName: requiredStringSchema("last name"),
  password: requiredStringSchema("password"),
  roles: z.array(rolesSchema).default([RolesEnum.USER]),
  cart: cartSchema,
});

export type User = z.infer<typeof userSchema>;

export const userWithoutCartSchema = userSchema.omit({ cart: true });

export const userDTOSchema = z.object({
  userId: uuidSchema("user id").optional(),
  email: emailSchema("user email"),
  firstName: requiredStringSchema("first name"),
  lastName: requiredStringSchema("last name"),
  cart: cartSchema.optional(),
});

export type UserDTO = z.infer<typeof userDTOSchema>;

export const userToUserDTO = (user: User) => {
  return userDTOSchema.parse(user);
};
