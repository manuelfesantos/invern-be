import { deleteAddress } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

const addressId = "1";

describe("deleteAddress", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });

  it("should delete an address", async () => {
    const result = await deleteAddress(addressId);
    expect(result).toBeUndefined();
    expect(dbSpy).toHaveBeenCalled();
  });
});
