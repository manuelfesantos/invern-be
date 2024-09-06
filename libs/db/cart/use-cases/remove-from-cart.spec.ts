import { removeFromCart } from "@cart-db";
import * as DB from "@db";
import * as GetQuantity from "./get-quantity-in-cart";
import { errors } from "@error-handling-utils";

jest.mock("@db", () => ({
  db: jest.fn().mockReturnValue({
    delete: jest.fn().mockReturnValue({
      where: jest.fn(),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn(),
      }),
    }),
  }),
}));

jest.mock("./get-quantity-in-cart", () => ({
  getQuantityInCart: jest.fn(),
}));

describe("removeFromCart", () => {
  const deleteSpy = jest.spyOn(DB.db(), "delete");
  const updateSpy = jest.spyOn(DB.db(), "update");
  const getQuantityInCartSpy = jest.spyOn(GetQuantity, "getQuantityInCart");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should remove from cart when quantity to remove is equal or greater than quantity in cart", async () => {
    const cartId = "1";
    const productId = "1";
    const quantity = 1;
    const quantityInCart = 1;
    getQuantityInCartSpy.mockResolvedValueOnce(quantityInCart);
    await removeFromCart(cartId, productId, quantity);
    expect(deleteSpy).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("should update cart when quantity to remove is less than quantity in cart", async () => {
    const cartId = "1";
    const productId = "1";
    const quantity = 1;
    const quantityInCart = 2;
    getQuantityInCartSpy.mockResolvedValueOnce(quantityInCart);
    await removeFromCart(cartId, productId, quantity);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });
  it("should throw error when the product tp remove is not in the cart", async () => {
    const cartId = "1";
    const productId = "1";
    const quantity = 1;
    const quantityInCart = 0;
    getQuantityInCartSpy.mockResolvedValueOnce(quantityInCart);
    await expect(removeFromCart(cartId, productId, quantity)).rejects.toThrow(
      errors.PRODUCT_NOT_IN_CART(),
    );
  });
});
