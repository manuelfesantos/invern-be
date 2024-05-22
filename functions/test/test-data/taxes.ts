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
    countryCode: "GB",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "AT",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "FR",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "DE",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "ES",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "CH",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "NL",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "BE",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "IE",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "IT",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "LU",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "CY",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "SI",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "SK",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "CZ",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "HU",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "RO",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "BG",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "GR",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "BA",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "HR",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "DK",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "EE",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "LV",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "LT",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "MT",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "FI",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "LI",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "MD",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "MC",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "ME",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "MK",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "PL",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "NO",
  },
  {
    name: "VAT",
    rate: 0.15,
    countryCode: "SE",
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
