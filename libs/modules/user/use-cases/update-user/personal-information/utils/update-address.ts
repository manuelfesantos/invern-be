import { InsertAddress } from "@address-entity";
import { getUpdateUserAction } from "@user-db";
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
  await getUpdateUserAction(id, {
    address: await encryptObject(address),
  }).run();
};
