import { validateCartId } from "./validate-cart-id";
import { ZodError } from "zod";
import * as CartDb from "@cart-db";
import { errors } from "@error-handling-utils";
import { Cart } from "@cart-entity";

jest.mock("@cart-db", () => ({
  getCartById: jest.fn(),
}));

jest.mock("@logger-utils", () => ({
  getLogger: jest.fn().mockReturnValue({ addData: jest.fn() }),
}));

describe("validateCartId", () => {
  const getCartByIdSpy = jest.spyOn(CartDb, "getCartById");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it.each(["", "123"])(
    "should throw error if cart id is invalid",
    async (cartId) => {
      await expect(async () => validateCartId(cartId)).rejects.toBeInstanceOf(
        ZodError,
      );
    },
  );
  it("should throw error if getCartById throws an error", async () => {
    const cartId = "vJPLBrF7ZZbDx6GoYAfNcK";
    getCartByIdSpy.mockRejectedValueOnce(new Error("Database Error"));
    await expect(validateCartId(cartId)).rejects.toEqual(
      expect.objectContaining({ message: "Database Error" }),
    );
  });
  it("should not throw error if cart is found", async () => {
    const cartId = "vJPLBrF7ZZbDx6GoYAfNcK";
    getCartByIdSpy.mockResolvedValueOnce(undefined as unknown as Cart);
    await expect(validateCartId(cartId)).rejects.toEqual(
      errors.CART_NOT_FOUND(),
    );
  });
});
