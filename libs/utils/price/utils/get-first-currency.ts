import { Country } from "@country-entity";
import { ClientCurrency } from "@currency-entity";

const FIRST_INDEX = 0;

export const getFirstCurrencyFromCountry = (
  country: Country,
): ClientCurrency => {
  const currency = country.currencies?.[FIRST_INDEX];

  if (!currency) {
    throw Error("Selected country has no currency!");
  }

  return currency;
};
