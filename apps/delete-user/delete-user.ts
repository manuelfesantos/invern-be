import { getUserById } from "@adapters/users/get-user";
import {
  errorResponse,
  generateErrorResponse,
} from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";
import { HttpParams } from "@entities/http/http-request";
import { deleteUser as deleteAdapter } from "@adapters/users/delete-user";

export const deleteUser = async (id: HttpParams) => {
  try {
    await deleteAdapter(id as string);

    return successResponse.OK("success deleting user");
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
