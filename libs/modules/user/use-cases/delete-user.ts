import { HttpParams } from "@http-entity";
import { getUserById } from "@user-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { deleteUser as deleteUserAdapter } from "@user-adapter";

export const deleteUser = async (id: HttpParams): Promise<Response> => {
  try {
    const user = await getUserById(id as string);
    await deleteUserAdapter(user.userId);
    return successResponse.OK("success deleting user");
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
