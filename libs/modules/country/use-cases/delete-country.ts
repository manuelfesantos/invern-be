import { getDeleteCountryAction as deleteCountryFromDb } from "@country-db";

export const deleteCountry = async (countryCode: string): Promise<void> => {
  await deleteCountryFromDb(countryCode).run();
};
