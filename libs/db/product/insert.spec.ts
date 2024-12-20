import { InsertProduct } from "@product-entity";
import { insertProduct } from "./insert";
import * as DB from "@db";
import { productsTable } from "@schema";
import * as Crypto from "@crypto-utils";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            productId: "1",
          },
        ]),
      }),
    }),
  }),
}));

jest.mock("@crypto-utils", () => ({
  getRandomUUID: jest.fn().mockReturnValue("productId"),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertProduct", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(productsTable), "values");
  const getRandomUUIDSpy = jest.spyOn(Crypto, "getRandomUUID");
  beforeEach(() => {
    valuesSpy.mockClear();
    getRandomUUIDSpy.mockClear();
  });
  it("should insert a product", async () => {
    const productInsert: InsertProduct = {
      collectionId: "test",
      name: "test",
      description: "test",
      stock: 1,
      priceInCents: 1,
    };

    getRandomUUIDSpy.mockReturnValueOnce("productId");

    const result = await insertProduct(productInsert);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT].productId).toEqual("1");
    expect(valuesSpy).toHaveBeenCalledWith({
      ...productInsert,
      id: "productId",
    });
  });
});
