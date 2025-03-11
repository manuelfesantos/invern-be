import { contextStore } from "@context-utils";
import { Address } from "@address-entity";
import { selectUserById } from "@user-db";
import { decryptObjectString } from "@crypto-utils";

export const getAddress = async (): Promise<Address | undefined> => {
  const { address, userId } = contextStore.context;
  if (address) {
    return decryptObjectString<Address>(address);
  }

  if (userId) {
    return getAddressFromUser(userId);
  }
};

const getAddressFromUser = async (
  userId: string,
): Promise<Address | undefined> => {
  const { address } = await selectUserById(userId);
  return address ?? undefined;
};
