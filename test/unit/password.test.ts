/**
 * Feature 02 / step-01: PBKDF2 password hashing + transparent legacy migration.
 */
import { hashPassword, verifyPassword, hashString } from "@crypto-utils";
import { withTestContext, makeTestEnv } from "../harness";

const USER_ID = "user-123";

// The legacy scheme: SHA-256(password + SALT + userId), hex. Reproduce it using
// the same SALT the harness fake Env provides, to test the migration path.
const legacyHashFor = async (password: string): Promise<string> => {
  const { env } = makeTestEnv();
  return hashString(`${password}${env.SALT}${USER_ID}`);
};

describe("password KDF + migration", () => {
  it("hashPassword produces a self-describing pbkdf2 hash", async () => {
    const stored = await withTestContext(() => hashPassword("hunter2"));
    expect(stored).toMatch(/^pbkdf2\$sha256\$\d+\$[^$]+\$[^$]+$/);
  });

  it("two hashes of the same password differ (random salt)", async () => {
    const [a, b] = await withTestContext(async () => [
      await hashPassword("hunter2"),
      await hashPassword("hunter2"),
    ]);
    expect(a).not.toBe(b);
  });

  it("verifyPassword accepts the correct password and rejects the wrong one", async () => {
    const result = await withTestContext(async () => {
      const stored = await hashPassword("hunter2");
      return {
        right: await verifyPassword("hunter2", stored, USER_ID),
        wrong: await verifyPassword("nope", stored, USER_ID),
      };
    });
    expect(result.right.valid).toBe(true);
    expect(result.right.needsRehash).toBe(false); // fresh hash, current params
    expect(result.wrong.valid).toBe(false);
  });

  it("verifies a LEGACY sha256 hash and flags it for rehash", async () => {
    const result = await withTestContext(async () => {
      const legacy = await legacyHashFor("hunter2");
      return {
        ok: await verifyPassword("hunter2", legacy, USER_ID),
        bad: await verifyPassword("wrong", legacy, USER_ID),
      };
    });
    expect(result.ok.valid).toBe(true);
    expect(result.ok.needsRehash).toBe(true); // legacy -> upgrade on login
    expect(result.bad.valid).toBe(false);
  });

  it("a legacy hash upgraded via hashPassword then verifies without rehash", async () => {
    const result = await withTestContext(async () => {
      // Simulate rehash-on-login: verify legacy, then store new-format hash.
      const legacy = await legacyHashFor("hunter2");
      const legacyCheck = await verifyPassword("hunter2", legacy, USER_ID);
      const upgraded = await hashPassword("hunter2");
      const afterCheck = await verifyPassword("hunter2", upgraded, USER_ID);
      return { legacyCheck, afterCheck };
    });
    expect(result.legacyCheck.needsRehash).toBe(true);
    expect(result.afterCheck.valid).toBe(true);
    expect(result.afterCheck.needsRehash).toBe(false);
  });

  it("rejects a malformed stored hash without throwing", async () => {
    const result = await withTestContext(() =>
      verifyPassword("hunter2", "not-a-valid-hash", USER_ID),
    );
    expect(result.valid).toBe(false);
    expect(result.needsRehash).toBe(false);
  });
});
