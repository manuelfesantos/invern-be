import { currenciesTable } from "@schema";
import { deleteCurrency } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteCurrency", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  beforeEach(() => {
    deleteSpy.mockClear();
  });
  it("should delete a currency", async () => {
    const currencyCode = "1";
    const result = await deleteCurrency(currencyCode);
    expect(result).toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledWith(currenciesTable);
  });
});
