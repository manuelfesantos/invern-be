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
};
