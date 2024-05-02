import { z } from "zod";
import { userDTOSchema } from "@user-entity";

export const loginBodySchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email({ message: "Invalid email" }),
  password: z.string({ required_error: "password is required" }),
});

export const signupBodySchema = userDTOSchema.extend({
  password: z.string({ required_error: "password is required" }),
});
