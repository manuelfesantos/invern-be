import { z } from "zod";
import {
  dateTimeSchema,
  positiveIntegerSchema,
  requiredStringSchema,
} from "@global-entity";

export const forgotSecretBodySchema = z.object({
  code: requiredStringSchema("forgot secret code"),
  expiresAt: dateTimeSchema("forgot secret issued at date"),
  attemptsLeft: positiveIntegerSchema("forgot secret attempts left"),
  emailsSent: positiveIntegerSchema("forgot secret emails sent"),
});

export type ForgotSecretBody = z.infer<typeof forgotSecretBodySchema>;
