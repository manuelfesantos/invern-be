import { HttpParams } from "@http-entity";
import { getUserById } from "@user-db";
import { successResponse } from "@response-entity";
import { deleteUser as deleteUserAdapter } from "@user-db";

export const deleteUser = async (id: HttpParams): Promise<Response> => {
  const user = await getUserById(id as string);
  await deleteUserAdapter(user.userId);
  return successResponse.OK("success deleting user");
};
