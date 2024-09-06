import { insertAddress } from "./insert";
import * as DB from "@db";
import * as Crypto from "@crypto-utils";

jest.mock("@crypto-utils", () => ({
  getRandomUUID: jest.fn().mockReturnValue("addressId"),
}));

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            addressId: "addressId",
          },
        ]),
      }),
    }),
  }),
}));

const address = {
  line1: "addressLine1",
  line2: "addressLine2",
  postalCode: "postalCode",
  city: "city",
  country: "country",
};

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertAddress", () => {
  const dbSpy = jest.spyOn(DB, "db");
  const getRandomUUIDSpy = jest.spyOn(Crypto, "getRandomUUID");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should insert an address", async () => {
    const result = await insertAddress(address);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT]).toHaveProperty("addressId");
    expect(result[FIRST_ELEMENT].addressId).toEqual("addressId");
    expect(dbSpy).toHaveBeenCalled();
    expect(getRandomUUIDSpy).toHaveBeenCalled();
  });
});
