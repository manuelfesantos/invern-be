import { encode } from "@encoding-utils";

const SIXTEEN = 16;
const TWO = 2;

export const hashPassword = async (
  password: string,
  id: string,
): Promise<string> => {
  return hashString(`${password}${id}`);
};

const hashString = async (input: string): Promise<string> => {
  const data = encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((byte) => byte.toString(SIXTEEN).padStart(TWO, "0"))
    .join("");
};
