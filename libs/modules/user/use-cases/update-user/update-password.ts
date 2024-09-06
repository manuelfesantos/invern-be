import {
  ResponseWithVersion,
  updatePasswordBodySchema,
} from "./types/update-user";
import { getUserById, updateUser } from "@user-db";
import { protectedSuccessResponse } from "@response-entity";
import { DEFAULT_USER_VERSION, userToUserDTO } from "@user-entity";
import { hashPassword } from "@crypto-utils";

export const updatePassword = async (
  tokens: { refreshToken: string; accessToken?: string },
  id: string,
  body: unknown,
  remember?: boolean,
): Promise<ResponseWithVersion> => {
  const { password } = updatePasswordBodySchema.parse(body);
  const user = await getUserById(id);

  const passwordHash = await hashPassword(password, id);

  await updateUser(id, { password: passwordHash });

  return {
    response: protectedSuccessResponse.OK(
      tokens,
      "user password updated",
      { user: userToUserDTO(user) },
      remember,
    ),
    version: user.version || DEFAULT_USER_VERSION,
  };
};
