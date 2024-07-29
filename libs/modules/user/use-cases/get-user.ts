import { HttpParams } from "@http-entity";
import { getUserById } from "@user-db";
import { successResponse } from "@response-entity";
import { DEFAULT_USER_VERSION, userToUserDTO } from "@user-entity";

export const getUser = async (id: HttpParams): Promise<Response> => {
  const user = await getUserById(id as string);
  return successResponse.OK("success getting user", userToUserDTO(user));
};

export const getUserVersion = async (id: HttpParams): Promise<Response> => {
  const user = await getUserById(id as string);
  return successResponse.OK("success getting user version", {
    version: user.version || DEFAULT_USER_VERSION,
  });
};
