import { z } from "zod";
import { emailSchema, requiredStringSchema } from "@global-entity";

export const updateUserBodySchema = z.object({
  email: emailSchema("user mail").optional(),
  password: requiredStringSchema("user password").optional(),
  firstName: requiredStringSchema("first name").optional(),
  lastName: requiredStringSchema("last name").optional(),
});
export const updateEmailBodySchema = z.object({
  email: emailSchema("user mail"),
});

export const updatePasswordBodySchema = z.object({
  password: requiredStringSchema("user password"),
});

export const updateNameBodySchema = z
  .object({
    firstName: requiredStringSchema("first name").optional(),
    lastName: requiredStringSchema("last name").optional(),
  })
  .refine(
    ({ firstName, lastName }) => Boolean(firstName) || Boolean(lastName),
    { message: "At least one field is required" },
  );

export type ResponseWithVersion = {
  response: Response;
  version: number;
};
