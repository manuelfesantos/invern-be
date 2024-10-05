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
  DATABASE_NOT_INITIALIZED: (): CustomError =>
    new CustomError(
      "Database not initialized",
      HttpStatusEnum.INTERNAL_SERVER_ERROR,
    ),
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
  CART_NOT_FOUND: (): CustomError =>
    new CustomError("Cart not found", HttpStatusEnum.NOT_FOUND),
  INVALID_PRODUCT_IDS: (ids: string[]): CustomError =>
    new CustomError(
      "The following product ids are invalid: " + ids,
      HttpStatusEnum.BAD_REQUEST,
    ),
  PRODUCTS_ARE_REQUIRED: (): CustomError =>
    new CustomError("Products are required", HttpStatusEnum.BAD_REQUEST),
  CART_IS_NOT_EMPTY: (): CustomError =>
    new CustomError("Cart is not empty", HttpStatusEnum.CONFLICT),
  CART_IS_EMPTY: (): CustomError =>
    new CustomError("Cart is empty", HttpStatusEnum.CONFLICT),
  ACTION_IS_REQUIRED: (): CustomError =>
    new CustomError("Action is required", HttpStatusEnum.BAD_REQUEST),
  INVALID_ACTION: (action: string): CustomError =>
    new CustomError(`Invalid action: ${action}`, HttpStatusEnum.BAD_REQUEST),
  INVALID_ADDRESS: (issue: string): CustomError =>
    new CustomError(`Invalid address: ${issue}`, HttpStatusEnum.BAD_REQUEST),
  INVALID_PAYMENT: (issue: string): CustomError =>
    new CustomError(`Invalid payment: ${issue}`, HttpStatusEnum.BAD_REQUEST),
  ORDER_ALREADY_EXISTS: (): CustomError =>
    new CustomError("Order already exists", HttpStatusEnum.CONFLICT),
  PAYMENT_ALREADY_EXISTS: (): CustomError =>
    new CustomError("Payment already exists", HttpStatusEnum.CONFLICT),
  INVALID_EVENT_TYPE: (type: string): CustomError =>
    new CustomError(`Invalid event type: ${type}`, HttpStatusEnum.BAD_REQUEST),
  INVALID_PAYLOAD: (issue: string): CustomError =>
    new CustomError(`Invalid payload: ${issue}`, HttpStatusEnum.BAD_REQUEST),
  ORDER_NOT_FOUND: (): CustomError =>
    new CustomError("Order not found", HttpStatusEnum.NOT_FOUND),
  ORDERS_NOT_FOUND: (): CustomError =>
    new CustomError("Orders not found", HttpStatusEnum.NOT_FOUND),
  UNAUTHORIZED: (message?: string): CustomError =>
    new CustomError(message || "Unauthorized", HttpStatusEnum.UNAUTHORIZED),
};
