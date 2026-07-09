import type { InsertTax } from "@tax-entity";
import { taxesTable } from "@schema";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

// `tax.id` is the Stripe TaxRate id, supplied by the caller — checkout charges
// via this id (`tax_rates`), so it must NOT be a locally-generated UUID.
const insertTaxQuery = (tax: InsertTax) =>
  db().insert(taxesTable).values(tax).returning({
    taxId: taxesTable.id,
  });

export const getInsertTaxAction = actionBuilder(insertTaxQuery);
