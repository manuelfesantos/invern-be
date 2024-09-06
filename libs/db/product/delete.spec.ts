import { deleteProduct } from "./delete";
import * as DB from "@db";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
  }),
}));

describe("deleteProduct", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  beforeEach(() => {
    deleteSpy.mockClear();
  });
  it("should delete a product", async () => {
    const productId = "1";
    const result = await deleteProduct(productId);
    expect(result).toBeUndefined();
    expect(deleteSpy).toHaveBeenCalled();
  });
});
