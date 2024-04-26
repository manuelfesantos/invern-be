import { userDTOSchema } from "@entities/user/user-entity";
import { z } from "zod";

export const updateUserActionSchema = z.enum(["email", "password"], {
  message: "Invalid action",
});
export const UpdateUserActionEnum = updateUserActionSchema.enum;
export type UpdateUserAction =
  (typeof UpdateUserActionEnum)[keyof typeof UpdateUserActionEnum];

export const userWithNewEmailSchema = userDTOSchema.extend({
  newEmail: z
    .string({ required_error: "newEmail is required" })
    .email({ message: "Invalid email" }),
});

export const userWithNewPasswordSchema = userDTOSchema.extend({
  newPassword: z.string({ required_error: "password is required" }),
});
