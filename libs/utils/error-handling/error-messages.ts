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
  ACTION_IS_REQUIRED: (): AdapterError =>
    new AdapterError("Action is required", HttpResponseEnum.BAD_REQUEST),
  INVALID_ACTION: (action: string): AdapterError =>
    new AdapterError(`Invalid action: ${action}`, HttpResponseEnum.BAD_REQUEST),
  LOGGER_NOT_INITIALIZED: (): AdapterError =>
    new AdapterError(
      "Logger not initialized",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
};
