import { taxesTable } from "@schema";
import { db } from "@db";
import { getStripeTaxes } from "@stripe-adapter";
import { percentageToRate } from "@number-utils";

export const insertTaxes = async (): Promise<void> => {
  const taxesList = await getStripeTaxes();
  for (const tax of taxesList) {
    const { country, id, percentage, display_name } = tax;
    await db()
      .insert(taxesTable)
      .values({
        name: display_name,
        id,
        countryCode: country || "PT",
        rate: percentageToRate(percentage),
      });
  }
};
