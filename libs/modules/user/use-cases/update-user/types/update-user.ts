import { z } from "zod";
import {
  emailSchema,
  requiredObjectSchema,
  requiredStringSchema,
} from "@global-entity";
import { insertAddressSchema } from "@address-entity";

export const updatePersonalInformationBodySchema = requiredObjectSchema(
  "personal information",
  {
    firstName: requiredStringSchema("first name"),
    lastName: requiredStringSchema("last name"),
    address: insertAddressSchema,
  },
).partial();

export const updateEmailBodySchema = z.object({
  email: emailSchema("email"),
});

export const updatePasswordBodySchema = z.object({
  currentPassword: requiredStringSchema("current password"),
  newPassword: requiredStringSchema("new password"),
});

export const validateSubmitEmailCodeBodySchema = z.object({
  code: requiredStringSchema("code"),
});
