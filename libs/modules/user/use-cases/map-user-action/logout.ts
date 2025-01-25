import { getAnonymousTokens } from "@jwt-utils";
import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import { ResponseContext } from "@http-entity";

interface ReturnType {
  responseContext: ResponseContext;
}

export const logout = async (): Promise<ReturnType> => {
  const { isLoggedOut } = contextStore.context;

  if (isLoggedOut) {
    throw errors.UNAUTHORIZED("not logged in");
  }

  return {
    responseContext: await getAnonymousTokens(),
  };
};
