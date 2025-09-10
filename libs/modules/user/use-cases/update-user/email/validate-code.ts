import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { getSelectUserByIdAction, getUpdateUserAction } from "@user-db";
import { validateSubmitEmailCodeBodySchema } from "../types/update-user";
import { validateNewEmailSecret } from "@user-module";
import { logCredentials } from "@logger-utils";
import { sendEmailChangeSuccessfulEmail } from "@sendgrid-adapter";
import { ENV } from "@env-utils";

export const validateUpdateEmailCode = async (body: unknown): Promise<void> => {
  const { code } = validateSubmitEmailCodeBodySchema.parse(body);
  const { userId, cartId, country } = contextStore.context;
  if (!userId) {
    throw errors.UNAUTHORIZED();
  }

  logCredentials(cartId, userId);

  const user = await getSelectUserByIdAction(userId).run();
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  const secret = await validateNewEmailSecret(user.email, code);

  await getUpdateUserAction(userId, {
    email: secret.newEmail,
  }).run();

  await sendEmailChangeSuccessfulEmail(
    user,
    secret.newEmail,
    `${ENV.FRONTEND_HOST}/${country.code.toLowerCase()}/profile/user-details`,
  );
};
