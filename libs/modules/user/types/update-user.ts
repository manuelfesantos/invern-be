import { z } from "zod";

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
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
});

export const updatePasswordBodySchema = z.object({
  password: z.string({
    required_error: "password is required",
  }),
});

export const updateNameBodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
