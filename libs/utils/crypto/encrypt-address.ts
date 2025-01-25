import { InsertAddress, insertAddressSchema } from "@address-entity";

export const encryptAddress = (address: InsertAddress): string => {
  const stringAddress = Object.entries(address)
    .map((entry) => entry.join(","))
    .join("|");
  return btoa(stringAddress);
};

export const decryptAddress = (encryptedAddress: string): InsertAddress =>
  insertAddressSchema.parse(
    Object.fromEntries(
      encryptedAddress.split("|").map((entry) => entry.split(",")),
    ),
  );
