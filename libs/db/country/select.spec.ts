import { getAllCountries, getCountryByCode } from "./select";

import * as DB from "@db";
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      countriesTable: {
        findMany: jest.fn().mockReturnValue([
          {
            code: "1",
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
                name: "name",
                rate: 15,
                amount: 15,
              },
            ],
          },
        ]),
        findFirst: jest.fn().mockReturnValue({
          code: "1",
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
              name: "name",
              rate: 15,
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
      const result = await getAllCountries();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual({
        code: "1",
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
            name: "name",
            rate: 15,
            amount: 15,
          },
        ],
      });
      expect(findManySpy).toHaveBeenCalled();
    });

    it("should return taxes as empty array if countries do not have taxes", async () => {
      const countryTemplate = [
        {
          code: "1",
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
        code: "1",
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
      const result = await getAllCountries();
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(result[FIRST_ELEMENT]).toEqual(country);
    });
  });

  describe("country by code", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.countriesTable, "findFirst");
    it("should get country by countryCode", async () => {
      const countryCode = "1";
      const result = await getCountryByCode(countryCode);
      expect(result).toEqual({
        code: "1",
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
            name: "name",
            rate: 15,
            amount: 15,
          },
        ],
      });
      expect(findFirstSpy).toHaveBeenCalled();
    });

    it("should return undefined if country not found", async () => {
      const countryCode = "2";
      findFirstSpy.mockReturnValue(
        undefined as unknown as SQLiteRelationalQuery<"async", undefined>,
      );
      const result = await getCountryByCode(countryCode);
      expect(result).toBeUndefined();
    });

    it("should return taxes as empty array if country has no taxes", async () => {
      const countryTemplate = {
        code: "1",
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
        code: "1",
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
      const result = await getCountryByCode("1");
      expect(result).toEqual(country);
    });
  });
});
