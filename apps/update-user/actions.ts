import {
  newEmailSchema,
  newNameSchema,
  newPasswordSchema,
} from "@apps/update-user/types";
import { updateEmail } from "@adapters/users/update-user/update-email";
import { userDTOSchema } from "@entities/user/user-entity";
import { successResponse } from "@entities/response/success-response";
import { updatePassword } from "@adapters/users/update-user/update-password";
import { updateName } from "@adapters/users/update-user/update-name";
import { errorResponse } from "@entities/response/error-response";

export const actionToUpdateMap = {
  "update-email": async (id: string, body: unknown) =>
    await updateEmailAction(id, body),
  "update-password": async (id: string, body: unknown) =>
    await updatePasswordAction(id, body),
  "update-name": async (id: string, body: unknown) =>
    await updateNameAction(id, body),
};

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
