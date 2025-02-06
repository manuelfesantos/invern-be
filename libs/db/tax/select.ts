import { taxesTable } from "@schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { Tax } from "@tax-entity";

export const getTaxById = async (id: string): Promise<Tax | undefined> => {
  return db().query.taxesTable.findFirst({
    where: eq(taxesTable.id, id),
    columns: {
      countryCode: false,
    },
  });
};

export const getTaxesByCountryCode = async (
  countryCode: string,
): Promise<Tax[]> => {
  return db().query.taxesTable.findMany({
    where: eq(taxesTable.countryCode, countryCode),
  });
};
