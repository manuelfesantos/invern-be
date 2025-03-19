import { taxesTable } from "@schema";
/* eslint-disable import/no-restricted-paths */
import { db } from "@db";
import { getStripeTaxes } from "@stripe-adapter";
/* eslint-enable import/no-restricted-paths */
import { percentageToRate } from "@number-utils";

export const insertTaxes = async (): Promise<void> => {
  const taxesList = await getStripeTaxes();
  await db()
    .insert(taxesTable)
    .values(
      taxesList.map(({ country, id, percentage, display_name }) => ({
        name: display_name,
        id,
        countryCode: country || "PT",
        rate: percentageToRate(percentage),
      })),
    );
};
