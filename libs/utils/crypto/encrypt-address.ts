import { InsertAddress } from "@address-entity";

export const encryptAddress = (address: InsertAddress): string => {
  const stringAddress = Object.entries(address)
    .map((entry) => entry.join(""))
    .join("");
  return btoa(stringAddress);
};
