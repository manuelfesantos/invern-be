import { db } from "@db";
import { countriesToCurrenciesTable } from "@schema";

const currenciesToCountries = [
  {
    currencyCode: "EUR",
    countryCode: "AT",
  },
  {
    currencyCode: "EUR",
    countryCode: "BE",
  },
  {
    currencyCode: "EUR",
    countryCode: "BA",
  },
  {
    currencyCode: "EUR",
    countryCode: "BG",
  },
  {
    currencyCode: "EUR",
    countryCode: "HR",
  },
  {
    currencyCode: "EUR",
    countryCode: "CY",
  },
  {
    currencyCode: "EUR",
    countryCode: "CZ",
  },
  {
    currencyCode: "EUR",
    countryCode: "DK",
  },
  {
    currencyCode: "EUR",
    countryCode: "EE",
  },
  {
    currencyCode: "EUR",
    countryCode: "FI",
  },
  {
    currencyCode: "EUR",
    countryCode: "FR",
  },
  {
    currencyCode: "EUR",
    countryCode: "DE",
  },
  {
    currencyCode: "EUR",
    countryCode: "GR",
  },
  {
    currencyCode: "EUR",
    countryCode: "HU",
  },
  {
    currencyCode: "EUR",
    countryCode: "IE",
  },
  {
    currencyCode: "EUR",
    countryCode: "IT",
  },
  {
    currencyCode: "EUR",
    countryCode: "LV",
  },
  {
    currencyCode: "EUR",
    countryCode: "LI",
  },
  {
    currencyCode: "EUR",
    countryCode: "LT",
  },
  {
    currencyCode: "EUR",
    countryCode: "LU",
  },
  {
    currencyCode: "EUR",
    countryCode: "MT",
  },
  {
    currencyCode: "EUR",
    countryCode: "MD",
  },
  {
    currencyCode: "EUR",
    countryCode: "MC",
  },
  {
    currencyCode: "EUR",
    countryCode: "ME",
  },
  {
    currencyCode: "EUR",
    countryCode: "NL",
  },
  {
    currencyCode: "EUR",
    countryCode: "MK",
  },
  {
    currencyCode: "EUR",
    countryCode: "NO",
  },
  {
    currencyCode: "EUR",
    countryCode: "PL",
  },
  {
    currencyCode: "EUR",
    countryCode: "PT",
  },
  {
    currencyCode: "EUR",
    countryCode: "RO",
  },
  {
    currencyCode: "EUR",
    countryCode: "SK",
  },
  {
    currencyCode: "EUR",
    countryCode: "SI",
  },
  {
    currencyCode: "EUR",
    countryCode: "ES",
  },
  {
    currencyCode: "EUR",
    countryCode: "SE",
  },
  {
    currencyCode: "EUR",
    countryCode: "CH",
  },
  {
    currencyCode: "GBP",
    countryCode: "GB",
  },
];

export const insertCurrenciesToCountries = async (): Promise<void> => {
  await db().insert(countriesToCurrenciesTable).values(currenciesToCountries);
};
