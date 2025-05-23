import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "@schema";
import { z } from "zod";
import { cartSchema } from "@cart-entity";
import {
  booleanSchema,
  dateTimeSchema,
  emailSchema,
  requiredObjectSchema,
  requiredStringSchema,
  uuidSchema,
} from "@global-entity";
import { addressSchema } from "@address-entity";

export const DEFAULT_USER_VERSION = 1;

export const baseUserSchema = createInsertSchema(usersTable, {
  id: uuidSchema("user id"),
  createdAt: dateTimeSchema("user creation date"),
  lastModifiedAt: dateTimeSchema("user last modified date"),
  password: requiredStringSchema("user password"),
  version: z.number().default(DEFAULT_USER_VERSION),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  email: emailSchema("user mail"),
  firstName: requiredStringSchema("user first name"),
  lastName: requiredStringSchema("user last name"),
  googleUserId: requiredStringSchema("user google id").optional(),
  isOauth: booleanSchema("user is oauth").default(false),
  isValidated: booleanSchema("user is validated").default(false),
});

export const insertUserSchema = baseUserSchema.omit({
  createdAt: true,
  lastModifiedAt: true,
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
  googleUserId: true,
  isOauth: true,
  createdAt: true,
  lastModifiedAt: true,
  version: true,
});

export const toUserDTO = (user: User): UserDTO => {
  return userDTOSchema.parse(user);
};

export const userDetailsSchema = requiredObjectSchema("Personal details", {
  email: insertUserSchema.shape.email,
  firstName: insertUserSchema.shape.firstName,
  lastName: insertUserSchema.shape.lastName,
});

export const UserValidationStatusEnum = {
  VALIDATED: true,
  NOT_VALIDATED: false,
  ALL: null,
} as const;

export type UserValidationStatus =
  (typeof UserValidationStatusEnum)[keyof typeof UserValidationStatusEnum];

export type User = z.infer<typeof userSchema>;
export type UserDTO = z.infer<typeof userDTOSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserDetails = z.infer<typeof userDetailsSchema>;
export type BaseUser = z.infer<typeof baseUserSchema>;
