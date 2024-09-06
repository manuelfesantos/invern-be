import { updateTax } from "./update";
import * as DB from "@db";
import { taxesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateTax", () => {
  const setSpy = jest.spyOn(DB.db().update(taxesTable), "set");
  beforeEach(() => {
    setSpy.mockClear();
  });
  it("should update tax", async () => {
    const taxId = "1";
    const changes = {
      name: "taxName",
    };
    await updateTax(taxId, changes);
    expect(setSpy).toHaveBeenCalledWith(changes);
  });
});
