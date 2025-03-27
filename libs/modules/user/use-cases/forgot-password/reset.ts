import {
  deleteForgotPasswordSecret,
  getForgotPasswordSecret,
  setAuthSecret,
} from "@kv-adapter";
import { validateSecret } from "./utils/validate-secret";
import { selectUserByEmail, updateUser } from "@user-db";
import { errors } from "@error-handling-utils";
import { getLoggedInRefreshToken } from "@jwt-utils";
import { hashPassword } from "@crypto-utils";

export const resetForgottenPassword = async (
  password: string,
  code: string,
  email: string,
): Promise<void> => {
  const user = await selectUserByEmail(email);
  if (!user) throw errors.USER_NOT_FOUND();
  const forgotSecret = await getForgotPasswordSecret(email);
  validateSecret(forgotSecret, code);
  await updateUser(user.id, {
    password: await hashPassword(password, user.id),
  });
  const userRefreshToken = await getLoggedInRefreshToken(user.id);
  await setAuthSecret(user.id, userRefreshToken);
  await deleteForgotPasswordSecret(email);
};
