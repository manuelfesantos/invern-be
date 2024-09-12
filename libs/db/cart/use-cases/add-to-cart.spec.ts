import { addToCart } from "./add-to-cart";
import * as CartDb from "@cart-db";
import * as DB from "@db";
import { errors } from "@error-handling-utils";

jest.mock("./get-quantity-in-cart", () => ({
  getQuantityInCart: jest.fn(),
}));

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      values: jest.fn(),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

const NO_QUANTITY = 0;
const ONE_QUANTITY = 1;

describe("addToCart", () => {
  const getQuantityInCartSpy = jest.spyOn(CartDb, "getQuantityInCart");
  const insertSpy = jest.spyOn(DB.db(), "insert");
  const updateSpy = jest.spyOn(DB.db(), "update");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should add to cart when quantity is 0", async () => {
    getQuantityInCartSpy.mockResolvedValueOnce(NO_QUANTITY);
    const cartId = "1";
    const productId = "1";
    const quantity = 1;
    const stock = 1;
    await addToCart(cartId, productId, quantity, stock);
    expect(getQuantityInCartSpy).toHaveBeenCalled();
    expect(insertSpy).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("should update cart when quantity is 1", async () => {
    getQuantityInCartSpy.mockResolvedValueOnce(ONE_QUANTITY);
    const cartId = "1";
    const productId = "1";
    const quantity = 1;
    const stock = 2;
    await addToCart(cartId, productId, quantity, stock);
    expect(getQuantityInCartSpy).toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });

  it("should throw error when quantity is greater than stock", async () => {
    getQuantityInCartSpy.mockResolvedValueOnce(ONE_QUANTITY);
    const cartId = "1";
    const productId = "1";
    const quantity = 1;
    const stock = 1;
    await expect(async () =>
      addToCart(cartId, productId, quantity, stock),
    ).rejects.toThrowError(errors.PRODUCT_OUT_OF_STOCK(stock));
  });
});
