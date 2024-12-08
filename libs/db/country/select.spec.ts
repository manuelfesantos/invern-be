import { selectAllCountries, getCountryByCode } from "./select";

import * as DB from "@db";
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";
import { CountryEnum, CountryEnumType } from "@country-entity";

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      countriesTable: {
        findMany: jest.fn().mockReturnValue([
          {
            code: "PT",
            name: "name",
            countriesToCurrencies: [
              {
                currency: {
                  symbol: "symbol",
                  name: "name",
                  code: "code",
                },
              },
            ],
            taxes: [
              {
                taxId: "1",
                name: "name",
                amount: 15,
              },
            ],
          },
        ]),
        findFirst: jest.fn().mockReturnValue({
          code: "PT",
          name: "name",
          countriesToCurrencies: [
            {
              currency: {
                symbol: "symbol",
                name: "name",
                code: "code",
              },
            },
          ],
          taxes: [
            {
              taxId: "2",
              name: "name",
              amount: 15,
            },
          ],
        }),
      },
    },
  }),
}));

describe("get", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("all countries", () => {
    const findManySpy = jest.spyOn(DB.db().query.countriesTable, "findMany");
    it("should get all countries", async () => {
      const result = await selectAllCountries();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        code: CountryEnum.PT,
        name: "name",
        currencies: [
          {
            symbol: "symbol",
            name: "name",
            code: "code",
          },
        ],
        taxes: [
          {
            taxId: "1",
            name: "name",
            amount: 15,
          },
        ],
      });
      expect(findManySpy).toHaveBeenCalled();
    });

    it("should return taxes as empty array if countries do not have taxes", async () => {
      const countryTemplate = [
        {
          code: CountryEnum.PT,
          name: "name",
          countriesToCurrencies: [
            {
              currency: {
                symbol: "symbol",
                name: "name",
                code: "code",
              },
            },
          ],
        },
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any;
      const country = {
        code: CountryEnum.PT,
        name: "name",
        currencies: [
          {
            symbol: "symbol",
            name: "name",
            code: "code",
          },
        ],
        taxes: [],
      };
      findManySpy.mockReturnValue(countryTemplate);
      const result = await selectAllCountries();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual(country);
    });
  });

  describe("countries by code", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.countriesTable, "findFirst");
    it("should get countries by countryCode", async () => {
      const countryCode = CountryEnum.PT;
      const result = await getCountryByCode(countryCode);
      expect(result).toEqual({
        code: CountryEnum.PT,
        name: "name",
        currencies: [
          {
            symbol: "symbol",
            name: "name",
            code: "code",
          },
        ],
        taxes: [
          {
            taxId: "2",
            name: "name",
            amount: 15,
          },
        ],
      });
      expect(findFirstSpy).toHaveBeenCalled();
    });

    it("should return undefined if countries not found", async () => {
      const countryCode = CountryEnum.ES;
      findFirstSpy.mockReturnValue(
        undefined as unknown as SQLiteRelationalQuery<
          "async",
          { name: string; code: CountryEnumType }
        >,
      );
      const result = await getCountryByCode(countryCode);
      expect(result).toBeUndefined();
    });

    it("should return taxes as empty array if countries has no taxes", async () => {
      const countryTemplate = {
        code: CountryEnum.ES,
        name: "name",
        countriesToCurrencies: [
          {
            currency: {
              symbol: "symbol",
              name: "name",
              code: "code",
            },
          },
        ],
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const country = {
        code: CountryEnum.ES,
        name: "name",
        currencies: [
          {
            symbol: "symbol",
            name: "name",
            code: "code",
          },
        ],
        taxes: [],
      };

      findFirstSpy.mockReturnValue(countryTemplate);
      const result = await getCountryByCode(CountryEnum.ES);
      expect(result).toEqual(country);
    });
  });
});
