import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";

export const deleteTax = async (taxId: string): Promise<void> => {
  await db().delete(taxesTable).where(eq(taxesTable.id, taxId));
};
