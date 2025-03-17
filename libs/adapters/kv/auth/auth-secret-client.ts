import { ENV } from "@env-utils";

export const getAuthSecret = async (key: string): Promise<string | null> => {
  return await ENV.AUTH_KV.get(key);
};

export const setAuthSecret = async (
  key: string,
  value: string,
): Promise<void> => {
  await ENV.AUTH_KV.put(key, value);
};

export const deleteAuthSecret = async (key: string): Promise<void> => {
  await ENV.AUTH_KV.delete(key);
};
