import type { Country } from "@country-entity";

const countriesMap = new Map<string, Country>();

const addCountry = (country: Country): void => {
  countriesMap.set(country.code, country);
};

const getCountryByCode = (code: string): Country | undefined => {
  return countriesMap.get(code);
};

export const countryCache = {
  add: addCountry,
  get: getCountryByCode,
};
