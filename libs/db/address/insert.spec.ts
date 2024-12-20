import { insertAddress } from "./insert";
import * as DB from "@db";
import * as Select from "./select";

jest.mock("@crypto-utils", () => ({
  encryptAddress: jest.fn().mockReturnValue("existingAddressId"),
}));

jest.mock("./select", () => ({
  addressExists: jest.fn(),
}));

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            addressId: "newAddressId",
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
  const addressExistsSpy = jest.spyOn(Select, "addressExists");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should insert an address if address does not exist yet", async () => {
    addressExistsSpy.mockResolvedValueOnce(false);
    const result = await insertAddress(address);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT]).toHaveProperty("addressId");
    expect(result[FIRST_ELEMENT].addressId).toEqual("newAddressId");
    expect(dbSpy).toHaveBeenCalled();
  });
  it("should return the existing addressId if the address already exists", async () => {
    addressExistsSpy.mockResolvedValueOnce(true);
    const result = await insertAddress(address);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT]).toHaveProperty("addressId");
    expect(result[FIRST_ELEMENT].addressId).toEqual("existingAddressId");
    expect(dbSpy).not.toHaveBeenCalled();
  });
});
