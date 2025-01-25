import { InsertTax } from "@tax-entity";
import { getRandomUUID } from "@crypto-utils";
import { taxesTable } from "@schema";
import { db } from "@db";
import { contextStore } from "@context-utils";

export const insertTax = async (
  tax: InsertTax,
): Promise<
  {
    taxId: string;
  }[]
> => {
  const insertTax = {
    ...tax,
    id: getRandomUUID(),
  };
  return (contextStore.context.transaction ?? db())
    .insert(taxesTable)
    .values(insertTax)
    .returning({
      taxId: taxesTable.id,
    });
};
