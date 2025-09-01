import { errors } from "@error-handling-utils";
import { contextStore } from "@context-utils";
import type { ResponseContext } from "@http-entity";
import { getAnonymousTokens } from "@jwt-utils";
import { getDeleteUserAction } from "@user-db";
import { getDeleteCartAction } from "@cart-db";

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
  const { cartId } = await getDeleteUserAction(userId).run();

  if (cartId) {
    await getDeleteCartAction(cartId).run();
  }

  return {
    responseContext: await getAnonymousTokens(),
  };
};
