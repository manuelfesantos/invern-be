import { insertTax } from "./insert";
import * as DB from "@db";
import { taxesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            taxId: "1",
          },
        ]),
      }),
    }),
  }),
}));

jest.mock("@crypto-utils", () => ({
  getRandomUUID: jest.fn().mockReturnValue("1"),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertTax", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(taxesTable), "values");
  it("should insert tax", async () => {
    const taxInsert = {
      amount: 10,
      countryCode: "Pt",
      name: "1",
      rate: 10,
    };
    const tax = await insertTax(taxInsert);

    expect(valuesSpy).toHaveBeenCalledWith({ ...taxInsert, taxId: "1" });

    expect(tax.length).toEqual(ONE_ELEMENT);

    expect(tax[FIRST_ELEMENT].taxId).toEqual("1");
  });
});
