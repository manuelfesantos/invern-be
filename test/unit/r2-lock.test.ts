import { acquireLock, releaseLock } from "../../libs/adapters/r2/utils/lock";
import { makeFakeR2, asR2Bucket, FakeR2 } from "./../fakes/r2";

const KEY = "lock-p1";
const TTL = 3000;

const storedValue = (fake: FakeR2): unknown =>
  JSON.parse(fake.store.get(KEY)?.body ?? "null");

const seedLock = (fake: FakeR2, expirationTime: number, token: string): void => {
  fake.store.set(KEY, {
    body: JSON.stringify({ expirationTime, token }),
    etag: "seed-etag",
  } as never);
};

describe("R2 lock", () => {
  it("acquires an unheld lock and stores { expirationTime, token } JSON", async () => {
    const fake = makeFakeR2();
    const ok = await acquireLock(asR2Bucket(fake), KEY, TTL, "A");
    expect(ok).toBe(true);
    expect(storedValue(fake)).toMatchObject({
      token: "A",
      expirationTime: expect.any(Number),
    });
  });

  it("refuses a lock that is currently held (not expired)", async () => {
    const fake = makeFakeR2();
    expect(await acquireLock(asR2Bucket(fake), KEY, TTL, "A")).toBe(true);
    expect(await acquireLock(asR2Bucket(fake), KEY, TTL, "B")).toBe(false);
  });

  it("two racing first-acquires yield exactly one winner", async () => {
    const fake = makeFakeR2();
    const results = await Promise.all([
      acquireLock(asR2Bucket(fake), KEY, TTL, "A"),
      acquireLock(asR2Bucket(fake), KEY, TTL, "B"),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("takes over an EXPIRED lock, and the renewed value is a valid held lock", async () => {
    const fake = makeFakeR2();
    seedLock(fake, Date.now() - 1000, "old"); // already expired

    expect(await acquireLock(asR2Bucket(fake), KEY, TTL, "new")).toBe(true);
    // Format-bug regression: the renewed value must parse as a held lock, so a
    // third caller sees it as held — not mis-read as expired and stolen.
    expect(storedValue(fake)).toMatchObject({ token: "new" });
    expect(await acquireLock(asR2Bucket(fake), KEY, TTL, "third")).toBe(false);
  });

  it("treats a legacy bare-number value as expired (stealable)", async () => {
    const fake = makeFakeR2();
    fake.store.set(KEY, {
      body: String(Date.now() + 999999), // old format: bare number string
      etag: "legacy-etag",
    } as never);
    expect(await acquireLock(asR2Bucket(fake), KEY, TTL, "A")).toBe(true);
  });

  it("releaseLock only deletes when the caller's token matches", async () => {
    const fake = makeFakeR2();
    await acquireLock(asR2Bucket(fake), KEY, TTL, "A");

    await releaseLock(asR2Bucket(fake), KEY, "someone-else");
    expect(fake.store.has(KEY)).toBe(true); // not deleted

    await releaseLock(asR2Bucket(fake), KEY, "A");
    expect(fake.store.has(KEY)).toBe(false); // deleted by holder
  });
});
