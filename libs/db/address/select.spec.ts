import { getAddressById } from "./select";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      addressesTable: {
        findFirst: jest.fn().mockReturnValue({
          addressId: "1",
          line1: "addressLine1",
          line2: "addressLine2",
          postalCode: "postalCode",
          city: "city",
          country: "country",
        }),
      },
    },
  }),
}));

describe("getAddressById", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });
  it("should get an address", async () => {
    const address = await getAddressById("1");
    expect(address).toEqual({
      addressId: "1",
      line1: "addressLine1",
      line2: "addressLine2",
      postalCode: "postalCode",
      city: "city",
      country: "country",
    });
    expect(dbSpy).toHaveBeenCalled();
  });
});
