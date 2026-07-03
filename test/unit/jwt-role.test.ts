/**
 * Feature 01 / step-01: the access-token JWT carries the user's role.
 */
import { getLoggedInToken, decodeJwt } from "@jwt-utils";
import { withTestContext } from "../harness";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const CART_ID = "22222222-2222-4222-8222-222222222222";

describe("access-token role claim", () => {
  it("an ADMIN user's issued token decodes with role === ADMIN", async () => {
    const decoded = await withTestContext(async () => {
      const token = await getLoggedInToken(USER_ID, CART_ID, "ADMIN");
      return decodeJwt(token);
    });

    expect(decoded).toMatchObject({
      userId: USER_ID,
      cartId: CART_ID,
      role: "ADMIN",
    });
  });

  it("a USER token decodes with role === USER", async () => {
    const decoded = await withTestContext(async () => {
      const token = await getLoggedInToken(USER_ID, CART_ID, "USER");
      return decodeJwt(token);
    });

    expect(decoded).toMatchObject({ userId: USER_ID, role: "USER" });
  });

  it("omits role when not supplied (legacy/anonymous) → undefined, treated as USER downstream", async () => {
    const decoded = await withTestContext(async () => {
      const token = await getLoggedInToken(USER_ID);
      return decodeJwt(token);
    });

    expect(decoded).toMatchObject({ userId: USER_ID });
    expect((decoded as { role?: string }).role).toBeUndefined();
  });
});
