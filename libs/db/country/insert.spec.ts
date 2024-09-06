import { InsertCountry } from "@country-entity";
import * as DB from "@db";

import { insertCountry } from "./insert";
import { countriesTable } from "@schema";

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

describe("insertCountry", () => {
  const insertSpy = jest.spyOn(DB.db(), "insert");
  const valuesSpy = jest.spyOn(DB.db().insert(countriesTable), "values");
  it("should insert a country", async () => {
    const country: InsertCountry = {
      code: "1",
      name: "name",
    };
    const result = await insertCountry(country);
    expect(result).toEqual([
      {
        code: "1",
      },
    ]);
    expect(insertSpy).toHaveBeenCalledWith(countriesTable);
    expect(valuesSpy).toHaveBeenCalledWith({ ...country });
  });
});
