import { z } from "zod";
import { emailSchema, requiredStringSchema } from "@global-entity";

export const updateUserActionSchema = z.enum(
  ["update-email", "update-password", "update-name"],
  {
    message: "Invalid action",
  },
);
export const UpdateUserActionEnum = updateUserActionSchema.enum;
export type UpdateUserAction =
  (typeof UpdateUserActionEnum)[keyof typeof UpdateUserActionEnum];

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
