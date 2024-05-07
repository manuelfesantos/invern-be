import { z } from "zod";
import { userDTOSchema } from "@user-entity";
import { emailSchema, requiredStringSchema } from "@global-entity";

export const userActionSchema = z.enum(["login", "signup", "authenticate"], {
  message: "invalid action",
  required_error: "action is required",
});

export const loginBodySchema = z.object({
  email: emailSchema("user email"),
  password: requiredStringSchema("user password"),
});

export const signupBodySchema = userDTOSchema.extend({
  password: requiredStringSchema("user password"),
});
