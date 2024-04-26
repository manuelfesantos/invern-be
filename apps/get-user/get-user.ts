import { initDb } from "@adapters/db";
import { getUserById } from "@adapters/users/get-user";
import {
  errorResponse,
  generateErrorResponse,
} from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";
import { userToUserDTO } from "@entities/user/user-entity";
import { HttpParams } from "@entities/http/http-request";

export const getUser = async (id: HttpParams) => {
  try {
    const user = await getUserById(id as string);

    return successResponse.OK("success getting user", userToUserDTO(user));
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
