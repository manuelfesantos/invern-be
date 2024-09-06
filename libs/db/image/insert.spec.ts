import { InsertImage } from "@image-entity";
import { insertImage } from "./insert";
import * as DB from "@db";
import { imagesTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue([
          {
            url: "url",
          },
        ]),
      }),
    }),
  }),
}));

const ONE_ELEMENT = 1;
const FIRST_ELEMENT = 0;

describe("insertImage", () => {
  const valuesSpy = jest.spyOn(DB.db().insert(imagesTable), "values");
  it("should insert image", async () => {
    const image: InsertImage = {
      url: "url",
      alt: "alt",
      productId: "productId",
      collectionId: "collectionId",
    };
    const result = await insertImage(image);
    expect(result).toHaveLength(ONE_ELEMENT);
    expect(result[FIRST_ELEMENT]).toEqual({
      url: "url",
    });
    expect(valuesSpy).toHaveBeenCalledWith(image);
  });
});
