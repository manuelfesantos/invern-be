import { decode, encode } from "@encoding-utils";

const FIRST_ELEMENT = 0;

const encrypt = async (encodedText: ArrayBuffer): Promise<ArrayBuffer> =>
  await crypto.subtle.digest("SHA-256", encodedText);

const hash = async (password: string, id: string): Promise<ArrayBuffer> => {
  const encodedText = encode(password + id);
  return encrypt(encodedText);
};

export const hashPassword = async (
  password: string,
  id: string,
): Promise<string> => {
  const passwordHash = await hash(password, id);
  return decode(passwordHash)
    .split("")
    .map((char) => char.charCodeAt(FIRST_ELEMENT).toString())
    .join("");
};
