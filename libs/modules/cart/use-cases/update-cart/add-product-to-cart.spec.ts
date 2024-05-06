import { addProductToCart } from "./add-product-to-cart";
import { errorResponse, successResponse } from "@response-entity";
import * as AddToCart from "@cart-adapter";
import { compareResponses, productIdAndQuantityMock } from "@mocks-utils";

const { productId, quantity } = productIdAndQuantityMock;

jest.mock("@cart-adapter", () => ({
  addToCart: jest.fn(),
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

describe("addProductToCart", () => {
  const addToCartSpy = jest.spyOn(AddToCart, "addToCart");
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should add product to cart", async () => {
    const response = await addProductToCart(validBody, "cartId");
    const expectedResponse = successResponse.OK("product added to cart");
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).toHaveBeenCalledWith("cartId", productId, quantity);
  });
  it("should not add product to cart if quantity is missing", async () => {
    const response = await addProductToCart(bodyWithoutQuantity, "cartId");
    const expectedResponse = errorResponse.BAD_REQUEST([
      "product quantity is required",
    ]);
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should not add product to cart if product id is missing", async () => {
    const response = await addProductToCart(bodyWithoutProductId, "cartId");
    const expectedResponse = errorResponse.BAD_REQUEST([
      "product id is required",
    ]);
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).not.toHaveBeenCalled();
  });
  it("should return an error if database throws an error", async () => {
    addToCartSpy.mockRejectedValue(new Error("database error"));
    const response = await addProductToCart(validBody, "cartId");
    const expectedResponse =
      errorResponse.INTERNAL_SERVER_ERROR("database error");
    await compareResponses(response, expectedResponse);
    expect(addToCartSpy).toHaveBeenCalled();
    expect(addToCartSpy).toHaveBeenCalledWith("cartId", productId, quantity);
  });
});
