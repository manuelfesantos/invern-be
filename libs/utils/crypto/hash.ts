import { encode } from "@encoding-utils";

const SIXTEEN = 16;
const TWO = 2;

let salt: string | null = null;

export const setSalt = (newSalt: string): void => {
  salt = newSalt;
};

export const hashPassword = async (
  password: string,
  id: string,
): Promise<string> => {
  if (!salt) {
    throw new Error("Salt is not set");
  }
  return hashString(`${password}${salt}${id}`);
};

const hashString = async (input: string): Promise<string> => {
  const data = encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((byte) => byte.toString(SIXTEEN).padStart(TWO, "0"))
    .join("");
};
