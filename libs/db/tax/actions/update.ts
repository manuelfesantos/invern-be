import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import type { InsertTax } from "@tax-entity";
import { actionBuilder } from "@generics-db";

const updateTaxQuery = (taxId: string, changes: Partial<InsertTax>) =>
  db()
    .update(taxesTable)
    .set(changes)
    .where(eq(taxesTable.id, taxId))
    .returning();

export const getUpdateTaxAction = actionBuilder(updateTaxQuery);
