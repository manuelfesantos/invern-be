import * as z from "zod";
import { insertAddressSchema } from "@address-entity";

export const updatePersonalInformationBodySchema = z
  .object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    address: insertAddressSchema,
  })
  .partial();

export const updateEmailBodySchema = z.object({
  email: z.email(),
});

export const updatePasswordBodySchema = z.object({
  currentPassword: z.string().nonempty(),
  newPassword: z.string().nonempty(),
});

export const validateSubmitEmailCodeBodySchema = z.object({
  code: z.string().nonempty(),
});
