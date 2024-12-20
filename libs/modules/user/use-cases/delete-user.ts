import { deleteUser as deleteUserAdapter, getUserById } from "@user-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { errors } from "@error-handling-utils";

export const deleteUser: ProtectedModuleFunction = async (
  tokens,
  remember,
  id?: string,
): Promise<Response> => {
  if (!id) {
    throw errors.UNAUTHORIZED();
  }
  const user = await getUserById(id);
  await deleteUserAdapter(user.id);
  return protectedSuccessResponse.OK(
    tokens,
    "success deleting user",
    undefined,
    remember,
  );
};
