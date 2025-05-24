const MAX_RETRIES = 3;
const ONE_INCREMENT = 1;
const MIN_RETRIES = 0;
export const withRetry = <T, K>(
  args: T,
  callBack: (args: T) => Promise<K>,
  retries: number = MIN_RETRIES,
): Promise<K> => {
  try {
    return callBack(args);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      return withRetry(args, callBack, retries + ONE_INCREMENT);
    }
    throw error;
  }
};
