import { InsertCurrency } from "@currency-entity";

import * as DB from "@db";
import { updateCurrency } from "./update";
import { currenciesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateCurrency", () => {
  const setSpy = jest.spyOn(DB.db().update(currenciesTable), "set");
  beforeEach(() => {
    setSpy.mockClear();
  });
  it("should update a currency", async () => {
    const currencyCode = "1";
    const currency: Partial<InsertCurrency> = {
      code: "1",
      name: "name",
      symbol: "symbol",
    };
    const result = await updateCurrency(currencyCode, currency);
    expect(result).toBeUndefined();
    expect(setSpy).toHaveBeenCalledWith(currency);
  });
});
