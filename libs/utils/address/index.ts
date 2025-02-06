import { Address } from "@address-entity";
import { decrypt, encrypt } from "@crypto-utils";

export const stringifyAddress = (address: Address): string =>
  Object.entries(address)
    .sort(([a], [b]) => a.localeCompare(b))
    .map((entry) => entry.join(","))
    .join("|");

export const parseAddressString = (addressString: string): Address => {
  const entries = addressString.split("|").map((entry) => entry.split(","));
  return Object.fromEntries(entries);
};

export const decryptAddress = async (address: string): Promise<Address> => {
  return parseAddressString(await decrypt(address));
};

export const encryptAddress = async (address: Address): Promise<string> => {
  return encrypt(stringifyAddress(address));
};
