import { deleteUser as deleteUserAdapter } from "@user-db";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { ResponseContext } from "@http-entity";
import { getAnonymousTokens } from "@jwt-utils";

interface ReturnType {
  responseContext: ResponseContext;
}

export const deleteUser = async (): Promise<ReturnType> => {
  const { userId } = contextStore.context;

  if (!userId) {
    throw errors.UNAUTHORIZED();
  }
  await deleteUserAdapter(userId);

  return {
    responseContext: await getAnonymousTokens(),
  };
};
