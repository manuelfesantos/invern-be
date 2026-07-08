import { getCredentials, getLoggedInToken } from "@jwt-utils";
import { getAnonymousTokens } from "@jwt-utils";
import { CookieNameEnum } from "@http-entity";
import { withTestContext } from "../harness";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CART_ID = "22222222-2222-4222-8222-222222222222";

const headersFor = (token: string, refreshToken: string): Headers =>
  new Headers({
    Authorization: `Bearer ${token}`,
    Cookie: `${CookieNameEnum.REFRESH_TOKEN}=${refreshToken}`,
  });

describe("getCredentials branch matrix", () => {
  it("rejects when tokens are missing", async () => {
    await withTestContext(async () => {
      await expect(getCredentials(new Headers())).rejects.toThrow();
    });
  });

  it("rejects when both access and refresh tokens are invalid", async () => {
    await withTestContext(async () => {
      await expect(
        getCredentials(headersFor("garbage", "garbage")),
      ).rejects.toThrow();
    });
  });

  it("resolves a valid logged-in access token to its user + role", async () => {
    await withTestContext(async () => {
      const token = await getLoggedInToken(USER_ID, CART_ID, "ADMIN");
      const { refreshToken } = await getAnonymousTokens();
      const creds = await getCredentials(headersFor(token, refreshToken));
      expect(creds.userId).toBe(USER_ID);
      expect(creds.cartId).toBe(CART_ID);
      expect(creds.role).toBe("ADMIN");
    });
  });

  it("resolves a valid anonymous access token to no user / no role", async () => {
    await withTestContext(async () => {
      const { accessToken, refreshToken } = await getAnonymousTokens();
      const creds = await getCredentials(headersFor(accessToken, refreshToken));
      expect(creds.userId).toBeUndefined();
      expect(creds.role).toBeUndefined();
      expect(creds.refreshToken).toBeTruthy();
    });
  });
});
