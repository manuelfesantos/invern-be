/**
 * Smoke test (b): a Web Crypto path.
 * Proves `crypto.subtle` works under the jest node environment, and that the
 * harness makes ENV-dependent code (hashPassword reads ENV.SALT) runnable.
 */
import { hashString, hashPassword } from "@crypto-utils";
import { withTestContext } from "../harness";

describe("crypto hashing (smoke)", () => {
  it("hashString is deterministic and returns a 64-char hex digest", async () => {
    const a = await hashString("hello world");
    const b = await hashString("hello world");
    const c = await hashString("different");

    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashPassword runs inside the harness (reads ENV.SALT) and is salted by id", async () => {
    const { forId1, forId2 } = await withTestContext(async () => ({
      forId1: await hashPassword("hunter2", "user-1"),
      forId2: await hashPassword("hunter2", "user-2"),
    }));

    // Same password, different user id → different hash (salted by id).
    expect(forId1).not.toBe(forId2);
    expect(forId1).toMatch(/^[0-9a-f]{64}$/);
  });
});
