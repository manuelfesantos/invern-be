import { InsertAddress } from "@address-entity";
import { addressesTable } from "@schema";
import { db } from "@db";
import { encryptAddress } from "@crypto-utils";
import { addressExists } from "./select";

export const insertAddress = async (
  address: InsertAddress,
): Promise<
  {
    addressId: string;
  }[]
> => {
  const addressId = encryptAddress(address);
  const addressAlreadyExists = await addressExists(addressId);

  if (addressAlreadyExists) {
    return [{ addressId }];
  }

  const insertAddress = {
    ...address,
    addressId,
  };
  return db().insert(addressesTable).values(insertAddress).returning({
    addressId: addressesTable.addressId,
  });
};
