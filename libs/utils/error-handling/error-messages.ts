import { AdapterError } from "./adapter-error";
import { HttpResponseEnum } from "@http-entity";

export const errors = {
  EMAIL_ALREADY_TAKEN: (): AdapterError =>
    new AdapterError("Email already taken", HttpResponseEnum.CONFLICT),
  INVALID_CREDENTIALS: (): AdapterError =>
    new AdapterError(
      "Invalid username or password",
      HttpResponseEnum.UNAUTHORIZED,
    ),
  USER_NOT_FOUND: (): AdapterError =>
    new AdapterError("User not found", HttpResponseEnum.NOT_FOUND),
  PRODUCT_NOT_IN_CART: (): AdapterError =>
    new AdapterError("Product not in cart", HttpResponseEnum.BAD_REQUEST),
  DATABASE_NOT_INITIALIZED: (): AdapterError =>
    new AdapterError(
      "Database not initialized",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
  PRODUCT_NOT_FOUND: (): AdapterError =>
    new AdapterError("Product not found", HttpResponseEnum.NOT_FOUND),
  COLLECTION_NOT_FOUND: (): AdapterError =>
    new AdapterError("Collection not found", HttpResponseEnum.NOT_FOUND),
  CART_NOT_FOUND: (): AdapterError =>
    new AdapterError("Cart not found", HttpResponseEnum.NOT_FOUND),
  INVALID_PRODUCT_IDS: (ids: string[]): AdapterError =>
    new AdapterError(
      "The following product ids are invalid: " + ids,
      HttpResponseEnum.BAD_REQUEST,
    ),
  PRODUCTS_ARE_REQUIRED: (): AdapterError =>
    new AdapterError("Products are required", HttpResponseEnum.BAD_REQUEST),
  CART_IS_NOT_EMPTY: (): AdapterError =>
    new AdapterError("Cart is not empty", HttpResponseEnum.CONFLICT),
  CART_IS_EMPTY: (): AdapterError =>
    new AdapterError("Cart is empty", HttpResponseEnum.CONFLICT),
  ACTION_IS_REQUIRED: (): AdapterError =>
    new AdapterError("Action is required", HttpResponseEnum.BAD_REQUEST),
  INVALID_ACTION: (action: string): AdapterError =>
    new AdapterError(`Invalid action: ${action}`, HttpResponseEnum.BAD_REQUEST),
  LOGGER_NOT_INITIALIZED: (): AdapterError =>
    new AdapterError(
      "Logger not initialized",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
  CHECKOUT_SESSION_CREATION_FAILED: (): AdapterError =>
    new AdapterError(
      "Checkout session creation failed",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
  INVALID_ADDRESS: (issue: string): AdapterError =>
    new AdapterError(`Invalid address: ${issue}`, HttpResponseEnum.BAD_REQUEST),
  INVALID_PAYMENT: (issue: string): AdapterError =>
    new AdapterError(`Invalid payment: ${issue}`, HttpResponseEnum.BAD_REQUEST),
  UNABLE_TO_CREATE_ORDER: (): AdapterError =>
    new AdapterError(
      "Unable to create order",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
  ORDER_ALREADY_EXISTS: (): AdapterError =>
    new AdapterError("Order already exists", HttpResponseEnum.CONFLICT),
};
