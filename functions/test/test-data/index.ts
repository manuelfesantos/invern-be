import { insertUsers } from "./users";
import { insertCollections } from "./collections";
import { insertProducts } from "./products";
import { insertImages } from "./images";
import { insertCountries } from "./countries";
import { insertCurrencies } from "./currencies";
import { insertTaxes } from "./taxes";

export const insertData = async (): Promise<void> => {
  await insertUsers();
  const collectionsResult = await insertCollections();
  const productsResult = await insertProducts(collectionsResult);
  await insertImages(productsResult, collectionsResult);
  await insertCountries();
  await insertCurrencies();
  await insertTaxes();
};
