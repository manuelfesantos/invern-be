import { updateProduct } from "./update";
import * as DB from "@db";
import { productsTable } from "@schema";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

describe("updateProduct", () => {
  const setSpy = jest.spyOn(DB.db().update(productsTable), "set");
  it("should update product", async () => {
    const productId = "1";
    const changes = {
      name: "new name",
      description: "new description",
    };
    await updateProduct(productId, changes);

    expect(setSpy).toHaveBeenCalledWith(changes);
  });
});
