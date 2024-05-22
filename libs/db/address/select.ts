import { db } from "@db";
import { addressesTable } from "@schema";
import { eq } from "drizzle-orm";
import { Address } from "@address-entity";

export const getAddressById = async (
  id: string,
): Promise<Address | undefined> => {
  return db().query.addressesTable.findFirst({
    where: eq(addressesTable.addressId, id),
  });
};
