import { decrypt, encrypt } from "./encryptor";

const stringifyObject = <T extends object>(object: T): string =>
  JSON.stringify(object);

const parseObjectString = <T extends object>(objectString: string): T =>
  JSON.parse(objectString);

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
