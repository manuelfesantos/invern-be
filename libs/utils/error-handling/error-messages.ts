import { CustomError } from "./custom-error";
import { HttpStatusEnum } from "@http-entity";

export const errors = {
  EMAIL_ALREADY_TAKEN: (): CustomError =>
    new CustomError("Email already taken", HttpStatusEnum.CONFLICT),
  INVALID_CREDENTIALS: (): CustomError =>
    new CustomError(
      "Invalid username or password",
      HttpStatusEnum.UNAUTHORIZED,
    ),
  USER_NOT_FOUND: (): CustomError =>
    new CustomError("User not found", HttpStatusEnum.NOT_FOUND),
  PRODUCT_NOT_IN_CART: (): CustomError =>
    new CustomError("Product not in cart", HttpStatusEnum.BAD_REQUEST),
  PRODUCT_NOT_FOUND: (productId?: string): CustomError =>
    new CustomError(
      `Product ${productId ? `with id ${productId} ` : ""}not found`,
      HttpStatusEnum.NOT_FOUND,
    ),
  PRODUCT_OUT_OF_STOCK: (stock: number): CustomError =>
    new CustomError(
      stock
        ? `Not enough stock available for this product. Only ${stock} in stock`
        : "Product out of stock",
      HttpStatusEnum.BAD_REQUEST,
    ),
  PRODUCTS_OUT_OF_STOCK: (
    products: { productId: string; stock: number }[],
  ): CustomError =>
    new CustomError(
      `The following product ids don't have enough stock: ${products.map(({ productId, stock }) => `${productId} with stock ${stock}`).join(", ")}`,
      HttpStatusEnum.BAD_REQUEST,
    ),
  COLLECTION_NOT_FOUND: (): CustomError =>
    new CustomError("Collection not found", HttpStatusEnum.NOT_FOUND),
  ADDRESS_NOT_PROVIDED: (): CustomError =>
    new CustomError("Address not provided", HttpStatusEnum.BAD_REQUEST),
  ADDRESS_COUNTRY_MISMATCH: (): CustomError =>
    new CustomError(
      "Address country does not match user country",
      HttpStatusEnum.BAD_REQUEST,
    ),
  CART_NOT_FOUND: (): CustomError =>
    new CustomError("Cart not found", HttpStatusEnum.NOT_FOUND),
  CART_NOT_PROVIDED: (): CustomError =>
    new CustomError("Cart empty or not provided", HttpStatusEnum.BAD_REQUEST),
  INVALID_PRODUCT_IDS: (ids: string[]): CustomError =>
    new CustomError(
      "The following product ids are invalid: " + ids,
      HttpStatusEnum.BAD_REQUEST,
    ),
  PRODUCTS_ARE_REQUIRED: (): CustomError =>
    new CustomError("Products are required", HttpStatusEnum.BAD_REQUEST),
  CART_IS_EMPTY: (): CustomError =>
    new CustomError("Cart is empty", HttpStatusEnum.CONFLICT),
  INVALID_PAYMENT: (issue: string): CustomError =>
    new CustomError(`Invalid payment: ${issue}`, HttpStatusEnum.BAD_REQUEST),
  ORDER_ALREADY_EXISTS: (): CustomError =>
    new CustomError("Order already exists", HttpStatusEnum.CONFLICT),
  PAYMENT_ALREADY_EXISTS: (): CustomError =>
    new CustomError("Payment already exists", HttpStatusEnum.CONFLICT),
  INVALID_PAYLOAD: (issue: string): CustomError =>
    new CustomError(`Invalid payload: ${issue}`, HttpStatusEnum.BAD_REQUEST),
  ORDER_NOT_FOUND: (): CustomError =>
    new CustomError("Order not found", HttpStatusEnum.NOT_FOUND),
  ORDERS_NOT_FOUND: (): CustomError =>
    new CustomError("Orders not found", HttpStatusEnum.NOT_FOUND),
  SHIPPING_METHOD_NOT_FOUND: (): CustomError =>
    new CustomError("Shipping method not found", HttpStatusEnum.NOT_FOUND),
  SHIPPING_RATE_NOT_FOUND: (): CustomError =>
    new CustomError("Shipping rate not found", HttpStatusEnum.NOT_FOUND),
  UNAUTHORIZED: (message?: string): CustomError =>
    new CustomError(message || "Unauthorized", HttpStatusEnum.UNAUTHORIZED),
};
