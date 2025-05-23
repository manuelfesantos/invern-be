import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { getSelectUserByIdAction, getUpdateUserAction } from "@user-db";
import { validateSubmitEmailCodeBodySchema } from "../types/update-user";
import { validateEmailSecret } from "@user-module";

export const validateUpdateEmailCode = async (body: unknown): Promise<void> => {
  const { code } = validateSubmitEmailCodeBodySchema.parse(body);
  const { userId } = contextStore.context;
  if (!userId) {
    throw errors.UNAUTHORIZED();
  }

  const user = await getSelectUserByIdAction(userId).run();
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  const secret = await validateEmailSecret(user.email, code);

  await getUpdateUserAction(userId, {
    email: secret.newEmail,
  }).run();
};
