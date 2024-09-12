import { updatePasswordBodySchema } from "./types/update-user";
import { getUserById, updateUser } from "@user-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { userToUserDTO } from "@user-entity";
import { hashPassword } from "@crypto-utils";

export const updatePassword: ProtectedModuleFunction = async (
  tokens: { refreshToken: string; accessToken?: string },
  remember: boolean | undefined,
  id: string,
  body: unknown,
) => {
  const { password } = updatePasswordBodySchema.parse(body);
  const user = await getUserById(id);

  const passwordHash = await hashPassword(password, id);

  await updateUser(id, { password: passwordHash });

  return protectedSuccessResponse.OK(
    tokens,
    "user password updated",
    { user: userToUserDTO(user) },
    remember,
  );
};
