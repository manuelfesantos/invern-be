import { decode, encode } from "@utils/encoding";

export const hash = async (password: string, id: string) => {
  const encodedText = encode(password + id);
  const hash = await crypto.subtle.digest("SHA-256", encodedText);
  return decode(hash);
};
