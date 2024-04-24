import { z } from "zod";
import { RolesEnum, rolesSchema } from "@entities/user/roles";
import { cartSchema } from "@entities/cart/cart-entity";

export const userSchema = z.object({
  id: z
    .string({ required_error: "id is required" })
    .uuid({ message: "Invalid id" }),
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
  firstName: z.string({ required_error: "firstName is required" }),
  lastName: z.string({ required_error: "lastName is required" }),
  password: z.string({ required_error: "password is required" }),
  roles: z.array(rolesSchema).default([RolesEnum.USER]),
  cart: cartSchema.optional(),
});

export type User = z.infer<typeof userSchema>;

export const userDTOSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
  firstName: z.string({ required_error: "firstName is required" }),
  lastName: z.string({ required_error: "lastName is required" }),
  cart: cartSchema.optional(),
});

export type UserDTO = z.infer<typeof userDTOSchema>;

export const userToUserDTO = (user: User) => {
  return userDTOSchema.parse(user);
};
