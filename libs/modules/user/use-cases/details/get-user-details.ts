import { UserDetails } from "@user-entity";
import { contextStore } from "@context-utils";
import { decryptObjectString } from "@crypto-utils";
import { getUserDetailsById } from "@user-db";

export const getUserDetails = async (): Promise<UserDetails | undefined> => {
  const { userDetails, userId } = contextStore.context;
  if (userDetails) {
    return decryptObjectString<UserDetails>(userDetails);
  }

  if (userId) {
    return await getUserDetailsById(userId);
  }
};
