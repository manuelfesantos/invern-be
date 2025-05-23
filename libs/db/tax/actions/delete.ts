import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const deleteTaxQuery = (taxId: string) =>
  db().delete(taxesTable).where(eq(taxesTable.id, taxId)).returning();

export const getDeleteTaxAction = actionBuilder(deleteTaxQuery);
