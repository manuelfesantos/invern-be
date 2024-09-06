import { db } from "@db";
import { addressesTable } from "@schema";
import { eq } from "drizzle-orm";
import { BaseAddress } from "@address-entity";

export const getAddressById = async (
  id: string,
): Promise<BaseAddress | undefined> => {
  return db().query.addressesTable.findFirst({
    where: eq(addressesTable.addressId, id),
  });
};
