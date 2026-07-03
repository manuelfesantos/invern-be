/**
 * Feature 02 / step-02: refresh tokens carry an exp and the stored auth secret
 * has a matching TTL.
 */
import { getLoggedInRefreshToken, decodeJwt } from "@jwt-utils";
import { setAuthSecret, deleteAuthSecret } from "@kv-adapter";
import { REFRESH_TOKEN_EXPIRY } from "@timer-utils";
import { withTestContext } from "../harness";
import { makeFakeKV } from "../fakes/kv";

const USER_ID = "11111111-1111-4111-8111-111111111111";

describe("refresh-token lifetime + revocation primitives", () => {
  it("getLoggedInRefreshToken carries userId and a future exp", async () => {
    const before = Math.floor(Date.now() / 1000);
    const decoded = await withTestContext(async () => {
      const token = await getLoggedInRefreshToken(USER_ID);
      return decodeJwt(token);
    });
    expect(decoded).toMatchObject({ userId: USER_ID });
    const exp = (decoded as { exp?: number }).exp;
    expect(exp).toBeDefined();
    // exp should be ~REFRESH_TOKEN_EXPIRY seconds in the future.
    expect(exp!).toBeGreaterThan(before);
    expect(exp!).toBeLessThanOrEqual(before + REFRESH_TOKEN_EXPIRY + 5);
  });

  it("setAuthSecret stores the secret with the refresh-token TTL", async () => {
    const authKv = makeFakeKV();
    await withTestContext(() => setAuthSecret(USER_ID, "refresh-token-value"), {
      bindings: { authKv },
    });
    const entry = authKv.store.get(USER_ID);
    expect(entry?.value).toBe("refresh-token-value");
    expect(entry?.expirationTtl).toBe(REFRESH_TOKEN_EXPIRY);
  });

  it("deleteAuthSecret removes the stored secret (logout revocation)", async () => {
    const authKv = makeFakeKV();
    await withTestContext(
      async () => {
        await setAuthSecret(USER_ID, "refresh-token-value");
        await deleteAuthSecret(USER_ID);
      },
      { bindings: { authKv } },
    );
    expect(authKv.store.has(USER_ID)).toBe(false);
  });
});
