const FIVE_CHARACTERS = 5;

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const getRandomCharacters = (length: number): string => {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const base64Encode = (data: string): string => {
  const randomDigit = getRandomCharacters(FIVE_CHARACTERS);
  return randomDigit.concat(btoa(data));
};

export const base64Decode = (data: string): string =>
  atob(data.slice(FIVE_CHARACTERS));
