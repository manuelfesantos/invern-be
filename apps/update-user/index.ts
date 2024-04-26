import {
  errorResponse,
  generateErrorResponse,
} from "@entities/response/error-response";
import { updateUserActionSchema } from "@apps/update-user/types";
import { actionToUpdateMap } from "@apps/update-user/actions";

export const updateUser = async (body: unknown, action: string | null) => {
  try {
    if (!action) {
      return errorResponse.BAD_REQUEST("action is required");
    }
    const updateUserAction = updateUserActionSchema.parse(action);
    return actionToUpdateMap[updateUserAction](body);
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};
