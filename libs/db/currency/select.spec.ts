import * as DB from "@db";
import {
  getCurrencies,
  getCurrenciesByCountryCode,
  getCurrencyByCode,
} from "./select";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      currenciesTable: {
        findMany: jest.fn().mockReturnValue([
          {
            code: "1",
            name: "name",
            symbol: "symbol",
            rateToEuro: 1,
          },
        ]),
        findFirst: jest.fn().mockReturnValue({
          code: "1",
          name: "name",
          symbol: "symbol",
          rateToEuro: 1,
        }),
      },
    },
  }),
}));

describe("get", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("currencies", () => {
    const findManySpy = jest.spyOn(DB.db().query.currenciesTable, "findMany");
    it("should get all currencies", async () => {
      const result = await getCurrencies();
      expect(result).toEqual([
        {
          code: "1",
          name: "name",
          symbol: "symbol",
          rateToEuro: 1,
        },
      ]);
      expect(findManySpy).toHaveBeenCalled();
    });
  });

  describe("currencyByCode", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.currenciesTable, "findFirst");
    it("should get a currency", async () => {
      const currencyCode = "1";

      const result = await getCurrencyByCode(currencyCode);
      expect(result).toEqual({
        code: "1",
        name: "name",
        symbol: "symbol",
        rateToEuro: 1,
      });
      expect(findFirstSpy).toHaveBeenCalled();
    });
  });
  describe("currenciesByCountryCode", () => {
    const findManySpy = jest.spyOn(DB.db().query.currenciesTable, "findMany");
    it("should get all currencies", async () => {
      const countryCode = "1";
      const result = await getCurrenciesByCountryCode(countryCode);
      expect(result).toEqual([
        {
          code: "1",
          name: "name",
          symbol: "symbol",
          rateToEuro: 1,
        },
      ]);
      expect(findManySpy).toHaveBeenCalled();
    });
  });
});
