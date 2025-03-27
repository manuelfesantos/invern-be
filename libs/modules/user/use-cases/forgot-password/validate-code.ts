import { getForgotPasswordSecret } from "@kv-adapter";
import { validateSecret } from "./utils/validate-secret";

export const validateForgotPasswordCode = async (
  code: string,
  email: string,
): Promise<void> => {
  const forgotSecret = await getForgotPasswordSecret(email);
  validateSecret(forgotSecret, code);
};
