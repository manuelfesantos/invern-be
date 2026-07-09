import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "@schema";
import * as z from "zod";
import { cartSchema } from "@cart-entity";
import { addressSchema } from "@address-entity";

export const DEFAULT_USER_VERSION = 1;

export const baseUserSchema = createInsertSchema(usersTable, {
  id: z.uuidv4(),
  createdAt: z.iso.datetime({ local: true }),
  lastModifiedAt: z.iso.datetime({ local: true }),
  password: z.string().nonempty().nullable(),
  version: z.number().default(DEFAULT_USER_VERSION),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  email: z.email(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty().nullable(),
  googleUserId: z.string().nonempty().nullable(),
  isOauth: z.boolean(),
  isValidated: z.boolean(),
  disabled: z.boolean().default(false),
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

// Admin-facing projection: operationally useful fields incl. `role`, but never
// secrets (password, googleUserId). Distinct from userDTOSchema, which hides
// role. Parsing strips any non-listed keys, so secrets can't leak through.
export const adminUserSchema = baseUserSchema.omit({
  password: true,
  googleUserId: true,
  version: true,
  cartId: true,
  address: true,
});

export const toAdminUser = (user: User | BaseUser): AdminUser =>
  adminUserSchema.parse(user);

export const userDetailsSchema = z.object({
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
export type AdminUser = z.infer<typeof adminUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserDetails = z.infer<typeof userDetailsSchema>;
export type BaseUser = z.infer<typeof baseUserSchema>;
