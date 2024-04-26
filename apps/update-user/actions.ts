import {
  userWithNewEmailSchema,
  userWithNewPasswordSchema,
} from "@apps/update-user/types";
import { updateEmail } from "@adapters/users/update-user/update-email";
import { userDTOSchema } from "@entities/user/user-entity";
import { successResponse } from "@entities/response/success-response";
import { updatePassword } from "@adapters/users/update-user/update-password";

export const actionToUpdateMap = {
  email: (body: unknown) => updateEmailAction(body),
  password: (body: unknown) => updatePasswordAction(body),
};

const updateEmailAction = async (body: unknown) => {
  const userWithNewEmail = userWithNewEmailSchema.parse(body);
  const response = await updateEmail(
    userDTOSchema.parse(userWithNewEmail),
    userWithNewEmail.newEmail,
  );
  return successResponse.OK("user email updated", response);
};

const updatePasswordAction = async (body: unknown) => {
  const userWithNewPassword = userWithNewPasswordSchema.parse(body);
  const response = await updatePassword(
    userDTOSchema.parse(userWithNewPassword),
    userWithNewPassword.newPassword,
  );
  return successResponse.OK("user password updated", response);
};
