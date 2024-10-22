import { updateCountry } from "./update";

import * as DB from "@db";
import { countriesTable } from "@schema";
import { CountryEnum } from "@country-entity";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));
describe("updateCountry", () => {
  const setSpy = jest.spyOn(DB.db().update(countriesTable), "set");
  it("should update a countries", async () => {
    const countryCode = CountryEnum.PT;
    const changes = {
      name: "newName",
    };
    const result = await updateCountry(countryCode, changes);
    expect(result).toBeUndefined();
    expect(setSpy).toHaveBeenCalledWith(changes);
  });
});
