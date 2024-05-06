import { updateUserActionSchema } from "../../types/update-user";
import { updateEmail } from "./update-email";
import { updatePassword } from "./update-password";
import { updateName } from "./update-name";
import { HttpParams } from "@http-entity";
import { errorResponse } from "@response-entity";

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
  if (!action) {
    return errorResponse.BAD_REQUEST("action is required");
  }
  const updateUserAction = updateUserActionSchema.parse(action);
  return await actionToUpdateMap[updateUserAction](id as string, body);
};
