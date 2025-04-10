import { validateBaseSecret } from "@user-module";

export const validateCode = async (
  code: string,
  email: string,
): Promise<void> => {
  await validateBaseSecret(email, code);
};
