import { selectAllCountries } from "@country-db";
import { ClientCountry } from "@country-entity";

export const getAllCountries = async (): Promise<ClientCountry[]> => {
  return await selectAllCountries();
};
