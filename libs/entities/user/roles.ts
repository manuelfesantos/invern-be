import { z } from "zod";

export const rolesSchema = z.enum(["ADMIN", "USER"]);
export const RolesEnum = rolesSchema.enum;
