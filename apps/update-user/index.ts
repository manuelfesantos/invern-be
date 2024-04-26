import {
  errorResponse,
  generateErrorResponse,
} from "@entities/response/error-response";
import { updateUserActionSchema } from "@apps/update-user/types";
import { actionToUpdateMap } from "@apps/update-user/actions";
import { HttpParams } from "@entities/http/http-request";

export const updateUser = async (
  id: HttpParams,
  body: unknown,
  action: string | null,
) => {
  try {
    if (!action) {
      return errorResponse.BAD_REQUEST("action is required");
    }
    const updateUserAction = updateUserActionSchema.parse(action);
    return await actionToUpdateMap[updateUserAction](id as string, body);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
