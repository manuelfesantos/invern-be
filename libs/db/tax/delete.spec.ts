import { deleteTax } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteTax", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete tax", async () => {
    const taxId = "1";
    await deleteTax(taxId);
    expect(deleteSpy).toHaveBeenCalled();
  });
});
