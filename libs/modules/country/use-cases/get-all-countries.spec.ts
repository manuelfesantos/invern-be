import { getAllCountries } from "@country-module";
import * as CountryDb from "@country-db";
import { compareResponses, countriesMock } from "@mocks-utils";
import { successResponse } from "@response-entity";

jest.mock("@country-db", () => ({
  selectAllCountries: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  redactPropertiesFromData: jest.fn(),
  logger: jest.fn().mockReturnValue({ addRedactedData: jest.fn() }),
}));

jest.mock("@jwt-utils", () => ({}));

describe("getAllCountries", () => {
  const getAllCountriesSpy = jest.spyOn(CountryDb, "selectAllCountries");
  it("should return all countries", async () => {
    getAllCountriesSpy.mockResolvedValue(countriesMock);
    const response = await getAllCountries();
    expect(response).toBeDefined();
    const ecpectedResponse = successResponse.OK(
      "success getting countries",
      countriesMock,
    );
    await compareResponses(response, ecpectedResponse);
  });

  it("should throw an error if getAllCountries throws an error", async () => {
    getAllCountriesSpy.mockRejectedValue(new Error("error"));
    await expect(async () => await getAllCountries()).rejects.toEqual(
      expect.objectContaining({ message: "error" }),
    );
  });
});
