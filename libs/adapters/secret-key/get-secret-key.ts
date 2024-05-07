export const getSecretKey = async (key: string): Promise<string> => {
  return await Promise.resolve("Secret Key " + key);
};
