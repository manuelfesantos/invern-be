import { decode, encode } from "@encoding-utils";

const FIRST_ELEMENT = 0;

const hash = async (password: string, id: string): Promise<ArrayBuffer> => {
  const encodedText = encode(password + id);
  return await crypto.subtle.digest("SHA-256", encodedText);
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

export const getRandomUUID = (): string => crypto.randomUUID();
