import { db } from "@db";
import { addressesTable } from "@schema";
import { eq } from "drizzle-orm";
import { BaseAddress } from "@address-entity";

export const getAddressById = async (
  id: string,
): Promise<BaseAddress | undefined> => {
  return db().query.addressesTable.findFirst({
    where: eq(addressesTable.id, id),
  });
};

export const addressExists = async (id: string): Promise<boolean> => {
  return Boolean(await getAddressById(id));
};
