import { updateUserActionSchema } from "./types/update-user";
import { updateEmail } from "./update-email";
import { updatePassword } from "./update-password";
import { updateName } from "./update-name";
import { HttpParams, HttpResponseEnum } from "@http-entity";
import { errors } from "@error-handling-utils";
import { incrementUserVersion } from "@user-db";

const actionToUpdateMap = {
  "update-email": updateEmail,
  "update-password": updatePassword,
  "update-name": updateName,
};

export const updateUser = async (
  id: HttpParams,
  body: unknown,
  action: string | null,
): Promise<Response> => {
  const userId = id as string;
  if (!action) {
    throw errors.ACTION_IS_REQUIRED();
  }
  const updateUserAction = updateUserActionSchema.parse(action);
  const { response, version } = await actionToUpdateMap[updateUserAction](
    userId,
    body,
  );
  if (
    response.status === HttpResponseEnum.OK ||
    response.status === HttpResponseEnum.CREATED
  ) {
    await incrementUserVersion(userId, version);
  }

  return response;
};
