import * as z from "zod";

/**
 * Lock value stored in R2. Both the first-acquire and the takeover path write
 * this exact shape (the previous code wrote an object in one path and a bare
 * number string in the other, so a renewed lock parsed to `undefined` and was
 * mis-read as expired).
 */
const lockValueSchema = z.object({
  expirationTime: z.number(),
  token: z.string(),
});

type LockValue = z.infer<typeof lockValueSchema>;

const parseLockValue = (text: string): LockValue | null => {
  try {
    return lockValueSchema.parse(JSON.parse(text));
  } catch {
    // Unparseable / legacy value → treat as expired (stealable).
    return null;
  }
};

/**
 * Acquire the R2 lock `lockKey` for `ttl` ms, tagged with the caller's `token`.
 *
 * Mutual exclusion:
 *  - **first acquire** (no object yet): write, then read back and only claim the
 *    lock if the surviving value carries this caller's token. R2 is strongly
 *    consistent, so of two racers the later writer wins and the earlier one sees
 *    the other's token on read-back and backs off.
 *  - **takeover of an expired lock**: conditional `put` on the etag we just read
 *    (`etagMatches`), so exactly one of several racing takers succeeds.
 *
 * A live (unexpired) lock is never stolen. Returns whether this caller holds it.
 *
 * NOTE: this is R2's weaker primitive; a Durable Object would give true
 * serialization if lock contention ever grows beyond per-product stock writes.
 */
export const acquireLock = async (
  bucket: R2Bucket,
  lockKey: string,
  ttl: number,
  token: string,
): Promise<boolean> => {
  const value = JSON.stringify({ expirationTime: Date.now() + ttl, token });
  const existingLock = await bucket.get(lockKey);

  if (!existingLock) {
    await bucket.put(lockKey, value);
    const readBack = await bucket.get(lockKey);
    const stored = readBack ? parseLockValue(await readBack.text()) : null;
    return stored?.token === token;
  }

  const current = parseLockValue(await existingLock.text());
  if (current && current.expirationTime >= Date.now()) {
    return false;
  }

  const updateResult = await bucket.put(lockKey, value, {
    onlyIf: { etagMatches: existingLock.etag },
  });
  return updateResult !== null;
};

/** Release the lock only if this caller still holds it (token match). */
export const releaseLock = async (
  bucket: R2Bucket,
  lockKey: string,
  token: string,
): Promise<void> => {
  const existingLock = await bucket.get(lockKey);
  if (!existingLock) return;

  const current = parseLockValue(await existingLock.text());
  if (current?.token === token) {
    await bucket.delete(lockKey);
  }
};
