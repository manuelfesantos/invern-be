import * as z from "zod";

export const baseValidationSecretBodySchema = z.object({
  code: z.string().nonempty(),
  expiresAt: z.iso.datetime({ local: true }),
  attemptsLeft: z.int().nonnegative(),
  emailsSent: z.int().nonnegative(),
});

export type BaseValidationSecretBody = z.infer<
  typeof baseValidationSecretBodySchema
>;

export const validateEmailSecretBodySchema =
  baseValidationSecretBodySchema.extend({
    remember: z.boolean(),
  });

export const validateNewEmailSecretBodySchema =
  baseValidationSecretBodySchema.extend({
    newEmail: z.email(),
  });

export type ValidateEmailSecretBody = z.infer<
  typeof validateEmailSecretBodySchema
>;

export type ValidateNewEmailSecretBody = z.infer<
  typeof validateNewEmailSecretBodySchema
>;
