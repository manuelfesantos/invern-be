import { CountryEnum, InsertCountry } from "@country-entity";
import * as DB from "@db";

import { insertCountry } from "./insert";
import { countriesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            code: "PT",
          },
        ]),
      }),
    }),
  }),
}));

describe("insertCountry", () => {
  const insertSpy = jest.spyOn(DB.db(), "insert");
  const valuesSpy = jest.spyOn(DB.db().insert(countriesTable), "values");
  it("should insert a countries", async () => {
    const country: InsertCountry = {
      code: CountryEnum.PT,
      name: "name",
      currencyCode: "EUR",
    };
    const result = await insertCountry(country);
    expect(result).toEqual([
      {
        code: CountryEnum.PT,
      },
    ]);
    expect(insertSpy).toHaveBeenCalledWith(countriesTable);
    expect(valuesSpy).toHaveBeenCalledWith({ ...country });
  });
});
