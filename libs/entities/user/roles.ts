import { z } from "zod";

export const rolesSchema = z.enum(["ADMIN", "USER"], {
  message: "Invalid role",
});
export const RolesEnum = rolesSchema.enum;
