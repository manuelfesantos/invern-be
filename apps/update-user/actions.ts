import {
  newEmailSchema,
  newNameSchema,
  newPasswordSchema,
} from "@apps/update-user/types";
import { updateEmail } from "@modules/user/update-user/update-email";
import { successResponse } from "@entities/response/success-response";
import { updatePassword } from "@modules/user/update-user/update-password";
import { updateName } from "@modules/user/update-user/update-name";
import { errorResponse } from "@entities/response/error-response";

const updateEmailAction = async (id: string, body: unknown) => {
  const { email } = newEmailSchema.parse(body);
  const response = await updateEmail(id, email);
  return successResponse.OK("user email updated", response);
};

const updatePasswordAction = async (id: string, body: unknown) => {
  const { password } = newPasswordSchema.parse(body);
  const response = await updatePassword(id, password);
  return successResponse.OK("user password updated", response);
};

const updateNameAction = async (id: string, body: unknown) => {
  const { firstName, lastName } = newNameSchema.parse(body);
  if (!firstName && !lastName) {
    return errorResponse.BAD_REQUEST("firstName or lastName is required");
  }
  const response = await updateName(id, firstName, lastName);
  return successResponse.OK("user name updated", response);
};

export const actionToUpdateMap = {
  "update-email": updateEmailAction,
  "update-password": updatePasswordAction,
  "update-name": updateNameAction,
};
