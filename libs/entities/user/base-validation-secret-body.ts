import { z } from "zod";
import {
  booleanSchema,
  dateTimeSchema,
  emailSchema,
  positiveIntegerSchema,
  requiredStringSchema,
} from "@global-entity";

export const baseValidationSecretBodySchema = z.object({
  code: requiredStringSchema("forgot secret code"),
  expiresAt: dateTimeSchema("forgot secret issued at date"),
  attemptsLeft: positiveIntegerSchema("forgot secret attempts left"),
  emailsSent: positiveIntegerSchema("forgot secret emails sent"),
});

export type BaseValidationSecretBody = z.infer<
  typeof baseValidationSecretBodySchema
>;

export const validateEmailSecretBodySchema =
  baseValidationSecretBodySchema.extend({
    remember: booleanSchema("forgot secret remember me"),
  });

export const validateNewEmailSecretBodySchema =
  baseValidationSecretBodySchema.extend({
    newEmail: emailSchema("forgot secret email"),
  });

export type ValidateEmailSecretBody = z.infer<
  typeof validateEmailSecretBodySchema
>;

export type ValidateNewEmailSecretBody = z.infer<
  typeof validateNewEmailSecretBodySchema
>;
