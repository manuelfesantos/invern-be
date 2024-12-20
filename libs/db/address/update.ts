import { InsertAddress } from "@address-entity";
import { db } from "@db";
import { addressesTable } from "@schema";
import { eq } from "drizzle-orm";

export const updateAddress = async (
  addressId: string,
  changes: Partial<InsertAddress>,
): Promise<void> => {
  await db()
    .update(addressesTable)
    .set(changes)
    .where(eq(addressesTable.id, addressId));
};
