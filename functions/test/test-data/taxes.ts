import { taxesTable } from "@schema";
import { db } from "@db";
import { getRandomUUID } from "@crypto-utils";
import { InsertTax } from "@tax-entity";

const getTaxesList = (): InsertTax[] => [
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "PT",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "ES",
  },
];

export const insertTaxes = async (): Promise<void> => {
  const taxesList = getTaxesList();
  for (const tax of taxesList) {
    await db()
      .insert(taxesTable)
      .values({
        ...tax,
        taxId: getRandomUUID(),
      });
  }
};
