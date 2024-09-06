import { getUserById } from "@user-db";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";

export const getUser: ProtectedModuleFunction = async (
  tokens,
  remember,
  id?: string,
): Promise<Response> => {
  if (!id) {
    throw errors.UNAUTHORIZED();
  }
  const user = await getUserById(id);
  return protectedSuccessResponse.OK(
    tokens,
    "success getting user",
    { user: userToUserDTO(user) },
    remember,
  );
};
