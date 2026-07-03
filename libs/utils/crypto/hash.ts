import { encode } from "@encoding-utils";

const SIXTEEN = 16;
const TWO = 2;

/**
 * Plain SHA-256 hex digest. Used for non-secret hashing (e.g. hashing a Google
 * user id). NOT for passwords — those use PBKDF2 via `./password`.
 */
export const hashString = async (input: string): Promise<string> => {
  const data = encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((byte) => byte.toString(SIXTEEN).padStart(TWO, "0"))
    .join("");
};
