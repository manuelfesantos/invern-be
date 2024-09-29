export const acquireLock = async (
  bucket: R2Bucket,
  lockKey: string,
  ttl: number,
): Promise<boolean> => {
  const expirationTime = Date.now() + ttl;
  const existingLock = await bucket.get(lockKey);

  if (!existingLock) {
    await bucket.put(lockKey, JSON.stringify({ expirationTime }));
    return true;
  }

  const lock = JSON.parse(await existingLock.text());

  if (lock.expirationTime >= Date.now()) {
    return false;
  }

  const updateResult = await bucket.put(lockKey, expirationTime.toString(), {
    onlyIf: { etagMatches: existingLock.etag },
  });
  return updateResult !== null;
};

export const releaseLock = async (
  bucket: R2Bucket,
  lockKey: string,
): Promise<void> => {
  await bucket.delete(lockKey);
};
