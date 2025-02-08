import { decrypt, encrypt } from "./encryptor";

const stringifyObject = <T extends object>(object: T): string =>
  Object.entries(object)
    .sort(([a], [b]) => a.localeCompare(b))
    .map((entry) => entry.join(","))
    .join("|");

const parseObjectString = <T extends object>(objectString: string): T => {
  const entries = objectString.split("|").map((entry) => entry.split(","));
  return Object.fromEntries(entries);
};

export const decryptObjectString = async <T extends object>(
  object: string,
): Promise<T> => {
  return parseObjectString(await decrypt(object));
};

export const encryptObject = async <T extends object>(
  object: T,
): Promise<string> => {
  return encrypt(stringifyObject(object));
};
