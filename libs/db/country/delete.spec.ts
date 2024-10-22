import { deleteCountry } from "./delete";
import * as DB from "@db";
import { countriesTable } from "@schema";
import { CountryEnum } from "@country-entity";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteCountry", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  beforeEach(() => {
    deleteSpy.mockClear();
  });
  it("should delete a countries", async () => {
    const countryCode = CountryEnum.PT;
    const result = await deleteCountry(countryCode);
    expect(result).toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledWith(countriesTable);
  });
});
