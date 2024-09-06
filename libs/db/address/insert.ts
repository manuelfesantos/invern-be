import { InsertAddress } from "@address-entity";
import { addressesTable } from "@schema";
import { db } from "@db";
import { getRandomUUID } from "@crypto-utils";

export const insertAddress = async (
  address: InsertAddress,
): Promise<
  {
    addressId: string;
  }[]
> => {
  const insertAddress = {
    ...address,
    addressId: getRandomUUID(),
  };
  return db().insert(addressesTable).values(insertAddress).returning({
    addressId: addressesTable.addressId,
  });
};
