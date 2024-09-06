let authSecretClient: KVNamespace | null = null;

export const initAuthSecretClient = (namespace: KVNamespace): void => {
  if (!authSecretClient) {
    authSecretClient = namespace;
  }
};

export const getAuthSecret = async (key: string): Promise<string | null> => {
  if (!authSecretClient) {
    throw new Error("Auth secret client not initialized");
  }
  return await authSecretClient.get(key);
};

export const setAuthSecret = async (
  key: string,
  value: string,
): Promise<void> => {
  if (!authSecretClient) {
    throw new Error("Auth secret client not initialized");
  }
  await authSecretClient.put(key, value);
};

export const deleteAuthSecret = async (key: string): Promise<void> => {
  if (!authSecretClient) {
    throw new Error("Auth secret client not initialized");
  }
  await authSecretClient.delete(key);
};
