import { z } from "zod";
import { dateTimeSchema, requiredStringSchema } from "@global-entity";

export const forgotSecretBodySchema = z.object({
  code: requiredStringSchema("forgot secret code"),
  expiresAt: dateTimeSchema("forgot secret issued at date"),
});

export type ForgotSecretBody = z.infer<typeof forgotSecretBodySchema>;
