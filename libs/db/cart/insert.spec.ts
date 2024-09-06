import { insertCart } from "./insert";
import * as DB from "@db";
import * as Crypto from "@crypto-utils";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            cartId: "cartId",
          },
        ]),
      }),
    }),
  }),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

jest.mock("@crypto-utils", () => ({
  getRandomUUID: jest.fn().mockReturnValue("cartId"),
}));

describe("insertCart", () => {
  const dbSpy = jest.spyOn(DB, "db");
  const getRandomUUIDSpy = jest.spyOn(Crypto, "getRandomUUID");
  beforeEach(() => {
    dbSpy.mockClear();
    getRandomUUIDSpy.mockClear();
  });
  it("should insert a cart", async () => {
    const result = await insertCart();
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT]).toHaveProperty("cartId");
    expect(result[FIRST_ELEMENT].cartId).toBe("cartId");
    expect(dbSpy).toHaveBeenCalled();
    expect(getRandomUUIDSpy).toHaveBeenCalled();
  });
});
