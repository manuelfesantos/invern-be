import { InsertAddress } from "@address-entity";
import { updateUser } from "@user-db";
import { encryptObject } from "@crypto-utils";
import { contextStore } from "@context-utils";

export const updateAddress = async (
  id: string,
  insertAddress: InsertAddress,
): Promise<void> => {
  const { country } = contextStore.context;
  const address = {
    ...insertAddress,
    country: country.code,
  };
  await updateUser(id, { address: await encryptObject(address) });
};
