import { validateSecret } from "./utils/validate-secret";

export const validateForgotPasswordCode = async (
  code: string,
  email: string,
): Promise<void> => {
  await validateSecret(email, code);
};
