import { getSelectAllCountriesAction } from "@country-db";
import type { ClientCountry } from "@country-entity";

export const getAllCountries = async (): Promise<ClientCountry[]> => {
  return await getSelectAllCountriesAction().run();
};
