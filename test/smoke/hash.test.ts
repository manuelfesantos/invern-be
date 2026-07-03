/**
 * Smoke test (b): a Web Crypto path.
 * Proves `crypto.subtle` works under the jest node environment.
 * (Password KDF behaviour is covered in test/unit/password.test.ts.)
 */
import { hashString } from "@crypto-utils";

describe("crypto hashing (smoke)", () => {
  it("hashString is deterministic and returns a 64-char hex digest", async () => {
    const a = await hashString("hello world");
    const b = await hashString("hello world");
    const c = await hashString("different");

    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
