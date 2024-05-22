import { db } from "@db";
import { countriesTable } from "@schema";
import { InsertCountry } from "@country-entity";

const countriesList: InsertCountry[] = [
  {
    name: "Austria",
    code: "AT",
  },
  {
    name: "Belgium",
    code: "BE",
  },
  {
    name: "Bosnia and Herzegovina",
    code: "BA",
  },
  {
    name: "Bulgaria",
    code: "BG",
  },
  {
    name: "Croatia",
    code: "HR",
  },
  {
    name: "Cyprus",
    code: "CY",
  },
  {
    name: "Czech Republic",
    code: "CZ",
  },
  {
    name: "Denmark",
    code: "DK",
  },
  {
    name: "Estonia",
    code: "EE",
  },
  {
    name: "Finland",
    code: "FI",
  },
  {
    name: "France",
    code: "FR",
  },
  {
    name: "Germany",
    code: "DE",
  },
  {
    name: "Greece",
    code: "GR",
  },
  {
    name: "Hungary",
    code: "HU",
  },
  {
    name: "Ireland",
    code: "IE",
  },
  {
    name: "Italy",
    code: "IT",
  },
  {
    name: "Latvia",
    code: "LV",
  },
  {
    name: "Liechtenstein",
    code: "LI",
  },
  {
    name: "Lithuania",
    code: "LT",
  },
  {
    name: "Luxembourg",
    code: "LU",
  },
  {
    name: "Malta",
    code: "MT",
  },
  {
    name: "Moldova",
    code: "MD",
  },
  {
    name: "Monaco",
    code: "MC",
  },
  {
    name: "Montenegro",
    code: "ME",
  },
  {
    name: "Netherlands",
    code: "NL",
  },
  {
    name: "North Macedonia",
    code: "MK",
  },
  {
    name: "Norway",
    code: "NO",
  },
  {
    name: "Poland",
    code: "PL",
  },
  {
    name: "Portugal",
    code: "PT",
  },
  {
    name: "Romania",
    code: "RO",
  },
  {
    name: "Slovakia",
    code: "SK",
  },
  {
    name: "Slovenia",
    code: "SI",
  },
  {
    name: "Spain",
    code: "ES",
  },
  {
    name: "Sweden",
    code: "SE",
  },
  {
    name: "Switzerland",
    code: "CH",
  },
  {
    name: "United Kingdom",
    code: "GB",
  },
];

export const insertCountries = async (): Promise<{ countryCode: string }[]> => {
  return db().insert(countriesTable).values(countriesList).returning({
    countryCode: countriesTable.code,
  });
};
