import { updatePasswordBodySchema } from "../../types/update-user";
import { getUserById, updateUser } from "@user-adapter";
import { successResponse } from "@response-entity";
import { userToUserDTO } from "@user-entity";
import { hash } from "@crypto-utils";

export const updatePassword = async (
  id: string,
  body: unknown,
): Promise<Response> => {
  const { password } = updatePasswordBodySchema.parse(body);
  const user = await getUserById(id);

  const passwordHash = await hashPassword(password, id);

  await updateUser(id, `password = '${passwordHash}'`);

  return successResponse.OK("user password updated", userToUserDTO(user));
};

const hashPassword = async (password: string, id: string): Promise<string> => {
  return await hash(password, id);
};
