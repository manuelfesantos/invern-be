import { generateErrorResponse } from "@entities/response/error-response";
import { successResponse } from "@entities/response/success-response";
import { userToUserDTO } from "@entities/user/user-entity";
import { HttpParams } from "@entities/http/http-request";
import { getUser as getUsermodule } from "@modules/user/get-user";

export const getUser = async (id: HttpParams) => {
  try {
    const user = await getUsermodule(id as string);

    return successResponse.OK("success getting user", userToUserDTO(user));
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
