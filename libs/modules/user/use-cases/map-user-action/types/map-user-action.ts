import { z } from "zod";
import { insertUserSchema, UserDTO } from "@user-entity";
import { emailSchema, requiredStringSchema } from "@global-entity";
import { ResponseContext } from "@http-entity";

export const userActionSchema = z.enum(["login", "signup", "logout"], {
  message: "invalid action",
  required_error: "action is required",
});

export const UserActionEnum = userActionSchema.Enum;

export const loginBodySchema = z.object({
  email: emailSchema("user mail"),
  password: requiredStringSchema("user password"),
  remember: z.boolean().default(false),
});

export const signupBodySchema = insertUserSchema
  .omit({ cartId: true })
  .merge(z.object({ remember: z.boolean().default(false) }));

export interface UserActionReturnType {
  shouldRemoveCartId?: boolean;
  shouldDeleteRemember?: boolean;
  user?: UserDTO;
  responseContext: ResponseContext;
}
