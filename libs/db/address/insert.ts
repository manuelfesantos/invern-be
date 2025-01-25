import { InsertAddress } from "@address-entity";
import { addressesTable } from "@schema";
import { db } from "@db";
import { contextStore } from "@context-utils";
import { encryptAddress } from "@crypto-utils";
import { addressExists } from "./select";

export const insertAddress = async (
  address: InsertAddress,
): Promise<string> => {
  const addressId = encryptAddress(address);
  const addressAlreadyExists = await addressExists(addressId);

  if (addressAlreadyExists) {
    return addressId;
  }

  const insertAddress = {
    ...address,
    id: addressId,
  };

  const [{ id }] = await (contextStore.context.transaction ?? db())
    .insert(addressesTable)
    .values(insertAddress)
    .returning({ id: addressesTable.id });

  return id;
};
