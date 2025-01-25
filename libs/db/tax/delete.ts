import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const deleteTax = async (taxId: string): Promise<void> => {
  await (contextStore.context.transaction ?? db())
    .delete(taxesTable)
    .where(eq(taxesTable.id, taxId));
};
