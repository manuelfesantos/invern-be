import { getTaxById, getTaxesByCountryCode } from "./select";

import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    query: {
      taxesTable: {
        findMany: jest.fn().mockReturnValue([
          {
            taxId: "1",
            taxName: "taxName",
          },
        ]),
        findFirst: jest.fn().mockReturnValue({
          taxId: "1",
          taxName: "taxName",
        }),
      },
    },
  }),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("get", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("tax by id", () => {
    const findFirstSpy = jest.spyOn(DB.db().query.taxesTable, "findFirst");
    it("should get taxes", async () => {
      const taxId = "1";
      const result = await getTaxById(taxId);
      expect(findFirstSpy).toHaveBeenCalled();
      expect(result).toEqual({
        taxId: "1",
        taxName: "taxName",
      });
    });
  });
  describe("taxes by countries code", () => {
    const findManySpy = jest.spyOn(DB.db().query.taxesTable, "findMany");
    it("should get taxes", async () => {
      const countryCode = "1";
      const result = await getTaxesByCountryCode(countryCode);
      expect(result).toHaveLength(ONE_ELEMENT);
      expect(findManySpy).toHaveBeenCalled();
      expect(result[FIRST_ELEMENT]).toEqual({
        taxId: "1",
        taxName: "taxName",
      });
    });
  });
});
