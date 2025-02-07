import { updateUserActionSchema } from "./types/update-user";
import { updateEmail } from "./update-email";
import { updatePassword } from "./update-password";
import { updateName } from "./update-name";
import { HttpStatusEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { incrementUserVersion } from "@user-db";
import { ProtectedModuleFunction } from "@response-entity";

const actionToUpdateMap = {
  "update-email": updateEmail,
  "update-password": updatePassword,
  "update-name": updateName,
};

export const updateUser: ProtectedModuleFunction = async (
  tokens,
  remember,
  body: unknown,
  action: string | null,
  id?: string,
): Promise<Response> => {
  const userId = id;

  if (!userId) {
    throw errors.UNAUTHORIZED("not logged in");
  }
  if (!action) {
    throw errors.ACTION_IS_REQUIRED();
  }
  const updateUserAction = updateUserActionSchema.parse(action);
  const response = await actionToUpdateMap[updateUserAction](
    tokens,
    remember,
    userId,
    body,
  );
  if (response.status === HttpStatusEnum.OK) {
    await incrementUserVersion(userId);
  }

  return response;
};
