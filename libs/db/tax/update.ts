import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { InsertTax } from "@tax-entity";

export const updateTax = async (
  taxId: string,
  changes: Partial<InsertTax>,
): Promise<void> => {
  await db().update(taxesTable).set(changes).where(eq(taxesTable.id, taxId));
};
