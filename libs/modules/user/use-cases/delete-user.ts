import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { ResponseContext } from "@http-entity";
import { getAnonymousTokens } from "@jwt-utils";
import { getDeleteUserAction } from "@user-db";

interface ReturnType {
  responseContext: ResponseContext;
}

export const deleteUser = async (userId?: string): Promise<ReturnType> => {
  if (!userId) {
    userId = contextStore.context.userId;
  }

  if (!userId) {
    throw errors.USER_NOT_FOUND();
  }
  await getDeleteUserAction(userId).run();

  return {
    responseContext: await getAnonymousTokens(),
  };
};
