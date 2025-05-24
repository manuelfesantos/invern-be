import { UserDetails } from "@user-entity";
import { contextStore } from "@context-utils";
import { decryptObjectString } from "@crypto-utils";
import { getSelectUserDetailsByIdAction } from "@user-db";
import { logCredentials } from "@logger-utils";

export const getUserDetails = async (): Promise<UserDetails | undefined> => {
  const { userDetails, userId, cartId } = contextStore.context;

  logCredentials(cartId, userId);

  if (userDetails) {
    return decryptObjectString<UserDetails>(userDetails);
  }

  if (userId) {
    return getSelectUserDetailsByIdAction(userId).run();
  }
};
