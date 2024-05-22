import { db } from "@db";
import { addressesTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteAddress = async (addressId: string): Promise<void> => {
  await db()
    .delete(addressesTable)
    .where(eq(addressesTable.addressId, addressId));
};
