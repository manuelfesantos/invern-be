import { generateErrorResponse } from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";
import { HttpParams } from "@entities/http/http-request";
import { deleteUser as deleteUserModule } from "@modules/user/delete-user";

export const deleteUser = async (id: HttpParams) => {
  try {
    await deleteUserModule(id as string);

    return successResponse.OK("success deleting user");
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
