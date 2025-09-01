import { contextStore } from "@context-utils";
import type { Address } from "@address-entity";
import { getSelectUserByIdAction } from "@user-db";
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
  const { address } = (await getSelectUserByIdAction(userId).run()) ?? {};
  return address ?? undefined;
};
