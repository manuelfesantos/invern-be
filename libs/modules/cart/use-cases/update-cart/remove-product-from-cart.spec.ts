import { removeProductFromCart } from "./remove-product-from-cart";
import { errorResponse, successResponse } from "@response-entity";
import { compareResponses, productIdAndQuantityMock } from "@mocks-utils";
import * as RemoveFromCart from "@cart-adapter";

const { productId, quantity } = productIdAndQuantityMock;

jest.mock("@cart-adapter", () => ({
  removeFromCart: jest.fn(),
}));

const validBody = productIdAndQuantityMock;

const bodyWithoutQuantity = {
  ...validBody,
  quantity: undefined,
};

const bodyWithoutProductId = {
  ...validBody,
  productId: undefined,
};

describe("removeProductFromCart", () => {
  const removeFromCartSpy = jest.spyOn(RemoveFromCart, "removeFromCart");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should remove product from cart", async () => {
    const response = await removeProductFromCart(validBody, "cartId");
    const expectedResponse = successResponse.OK("product removed from cart");
    await compareResponses(response, expectedResponse);
    expect(removeFromCartSpy).toHaveBeenCalledWith(
      "cartId",
      productId,
      quantity,
    );
  });
  it("should not remove product from cart if quantity is missing", async () => {
    const response = await removeProductFromCart(bodyWithoutQuantity, "cartId");
    const expectedResponse = errorResponse.BAD_REQUEST([
      "product quantity is required",
    ]);
    await compareResponses(response, expectedResponse);
    expect(removeFromCartSpy).not.toHaveBeenCalled();
  });
  it("should not remove product from cart if product id is missing", async () => {
    const response = await removeProductFromCart(
      bodyWithoutProductId,
      "cartId",
    );
    const expectedResponse = errorResponse.BAD_REQUEST([
      "product id is required",
    ]);
    await compareResponses(response, expectedResponse);
    expect(removeFromCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if database throws an error", async () => {
    removeFromCartSpy.mockRejectedValue(new Error("database error"));
    const response = await removeProductFromCart(validBody, "cartId");
    const expectedResponse =
      errorResponse.INTERNAL_SERVER_ERROR("database error");
    await compareResponses(response, expectedResponse);
    expect(removeFromCartSpy).toHaveBeenCalledWith(
      "cartId",
      productId,
      quantity,
    );
  });
});
