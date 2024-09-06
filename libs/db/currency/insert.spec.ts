import { InsertCurrency } from "@currency-entity";
import { insertCurrency } from "./insert";

import * as DB from "@db";
import { currenciesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            code: "1",
          },
        ]),
      }),
    }),
  }),
}));

describe("insertCurrency", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(currenciesTable), "values");
  beforeEach(() => {
    valuesSpy.mockClear();
  });
  it("should insert a currency", async () => {
    const currency: InsertCurrency = {
      code: "1",
      name: "name",
      symbol: "symbol",
      rateToEuro: 1,
    };

    const result = await insertCurrency(currency);
    expect(result).toEqual([{ code: "1" }]);
    expect(valuesSpy).toHaveBeenCalledWith(currency);
  });
});
