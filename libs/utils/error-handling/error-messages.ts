import { CustomError } from "./custom-error";
import { HttpResponseEnum } from "@http-entity";

export const errors = {
  EMAIL_ALREADY_TAKEN: (): CustomError =>
    new CustomError("Email already taken", HttpResponseEnum.CONFLICT),
  INVALID_CREDENTIALS: (): CustomError =>
    new CustomError(
      "Invalid username or password",
      HttpResponseEnum.UNAUTHORIZED,
    ),
  USER_NOT_FOUND: (): CustomError =>
    new CustomError("User not found", HttpResponseEnum.NOT_FOUND),
  PRODUCT_NOT_IN_CART: (): CustomError =>
    new CustomError("Product not in cart", HttpResponseEnum.BAD_REQUEST),
  DATABASE_NOT_INITIALIZED: (): CustomError =>
    new CustomError(
      "Database not initialized",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
  PRODUCT_NOT_FOUND: (productId?: string): CustomError =>
    new CustomError(
      `Product ${productId ? `with id ${productId} ` : ""}not found`,
      HttpResponseEnum.NOT_FOUND,
    ),
  PRODUCT_OUT_OF_STOCK: (stock: number): CustomError =>
    new CustomError(
      stock
        ? `Not enough stock available for this product. Only ${stock} in stock`
        : "Product out of stock",
      HttpResponseEnum.BAD_REQUEST,
    ),
  PRODUCTS_OUT_OF_STOCK: (
    products: { productId: string; stock: number }[],
  ): CustomError =>
    new CustomError(
      `The following product ids don't have enough stock: ${products.map(({ productId, stock }) => `${productId} with stock ${stock}`).join(", ")}`,
      HttpResponseEnum.BAD_REQUEST,
    ),
  COLLECTION_NOT_FOUND: (): CustomError =>
    new CustomError("Collection not found", HttpResponseEnum.NOT_FOUND),
  CART_NOT_FOUND: (): CustomError =>
    new CustomError("Cart not found", HttpResponseEnum.NOT_FOUND),
  INVALID_PRODUCT_IDS: (ids: string[]): CustomError =>
    new CustomError(
      "The following product ids are invalid: " + ids,
      HttpResponseEnum.BAD_REQUEST,
    ),
  PRODUCTS_ARE_REQUIRED: (): CustomError =>
    new CustomError("Products are required", HttpResponseEnum.BAD_REQUEST),
  CART_IS_NOT_EMPTY: (): CustomError =>
    new CustomError("Cart is not empty", HttpResponseEnum.CONFLICT),
  CART_IS_EMPTY: (): CustomError =>
    new CustomError("Cart is empty", HttpResponseEnum.CONFLICT),
  ACTION_IS_REQUIRED: (): CustomError =>
    new CustomError("Action is required", HttpResponseEnum.BAD_REQUEST),
  INVALID_ACTION: (action: string): CustomError =>
    new CustomError(`Invalid action: ${action}`, HttpResponseEnum.BAD_REQUEST),
  INVALID_ADDRESS: (issue: string): CustomError =>
    new CustomError(`Invalid address: ${issue}`, HttpResponseEnum.BAD_REQUEST),
  INVALID_PAYMENT: (issue: string): CustomError =>
    new CustomError(`Invalid payment: ${issue}`, HttpResponseEnum.BAD_REQUEST),
  ORDER_ALREADY_EXISTS: (): CustomError =>
    new CustomError("Order already exists", HttpResponseEnum.CONFLICT),
  PAYMENT_ALREADY_EXISTS: (): CustomError =>
    new CustomError("Payment already exists", HttpResponseEnum.CONFLICT),
  INVALID_EVENT_TYPE: (type: string): CustomError =>
    new CustomError(
      `Invalid event type: ${type}`,
      HttpResponseEnum.BAD_REQUEST,
    ),
  INVALID_PAYLOAD: (issue: string): CustomError =>
    new CustomError(`Invalid payload: ${issue}`, HttpResponseEnum.BAD_REQUEST),
  ORDER_NOT_FOUND: (): CustomError =>
    new CustomError("Order not found", HttpResponseEnum.NOT_FOUND),
  ORDERS_NOT_FOUND: (): CustomError =>
    new CustomError("Orders not found", HttpResponseEnum.NOT_FOUND),
  UNAUTHORIZED: (message?: string): CustomError =>
    new CustomError(message || "Unauthorized", HttpResponseEnum.UNAUTHORIZED),
};
