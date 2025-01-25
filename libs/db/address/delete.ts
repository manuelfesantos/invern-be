import { db } from "@db";
import { contextStore } from "@context-utils";
import { addressesTable } from "@schema";
import { eq } from "drizzle-orm";

export const deleteAddress = async (addressId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(addressesTable)
    .where(eq(addressesTable.id, addressId));
};
