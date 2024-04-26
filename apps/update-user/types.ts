import { userDTOSchema } from "@entities/user/user-entity";
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

export const newEmailSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
});

export const newPasswordSchema = z.object({
  password: z.string({
    required_error: "password is required",
  }),
});

export const newNameSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
