import {
  ResponseWithVersion,
  updatePasswordBodySchema,
} from "./types/update-user";
import { getUserById, updateUser } from "@user-db";
import { successResponse } from "@response-entity";
import { DEFAULT_USER_VERSION, userToUserDTO } from "@user-entity";
import { hashPassword } from "@crypto-utils";

export const updatePassword = async (
  id: string,
  body: unknown,
): Promise<ResponseWithVersion> => {
  const { password } = updatePasswordBodySchema.parse(body);
  const user = await getUserById(id);

  const passwordHash = await hashPassword(password, id);

  await updateUser(id, { password: passwordHash });

  return {
    response: successResponse.OK("user password updated", userToUserDTO(user)),
    version: user.version || DEFAULT_USER_VERSION,
  };
};
