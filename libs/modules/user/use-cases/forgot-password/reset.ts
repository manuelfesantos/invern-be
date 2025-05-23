import { deleteValidationSecret, setAuthSecret } from "@kv-adapter";
import { validateBaseSecret } from "@user-module";
import { getSelectUserByEmailAction, getUpdateUserAction } from "@user-db";
import { errors } from "@error-handling-utils";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { hashPassword } from "@crypto-utils";

export const resetForgottenPassword = async (
  password: string,
  code: string,
  email: string,
): Promise<void> => {
  const user = await getSelectUserByEmailAction(email).run();
  if (!user) throw errors.USER_NOT_FOUND();
  await validateBaseSecret(email, code);
  await getUpdateUserAction(user.id, {
    password: await hashPassword(password, user.id),
  }).run();
  const userRefreshToken = await getLoggedInRefreshToken(user.id);
  await setAuthSecret(user.id, userRefreshToken);
  await deleteValidationSecret(email);
};
