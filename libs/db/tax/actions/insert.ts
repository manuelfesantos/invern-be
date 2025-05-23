import { InsertTax } from "@tax-entity";
import { getRandomUUID } from "@crypto-utils";
import { taxesTable } from "@schema";
import { db } from "@db";
import { actionBuilder } from "@generics-db";

const insertTaxQuery = (tax: InsertTax) => {
  const insertTax = {
    ...tax,
    id: getRandomUUID(),
  };
  return db().insert(taxesTable).values(insertTax).returning({
    taxId: taxesTable.id,
  });
};

export const getInsertTaxAction = actionBuilder(insertTaxQuery);
