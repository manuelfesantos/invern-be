import { updateAddress } from "./update";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateAddress", () => {
  const dbSpy = jest.spyOn(DB, "db");
  beforeEach(() => {
    dbSpy.mockClear();
  });
  it("should update an address", async () => {
    const result = await updateAddress("1", {
      line1: "addressLine1",
    });
    expect(result).toBeUndefined();
    expect(dbSpy).toHaveBeenCalled();
  });
});
