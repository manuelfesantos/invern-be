import { AdapterError } from "./adapter-error";
import { HttpResponseEnum } from "@http-entity";

export const errors = {
  EMAIL_ALREADY_TAKEN: () =>
    new AdapterError("Email already taken", HttpResponseEnum.CONFLICT),
  INVALID_CREDENTIALS: () =>
    new AdapterError(
      "Invalid username or password",
      HttpResponseEnum.UNAUTHORIZED,
    ),
  USER_NOT_FOUND: () =>
    new AdapterError("User not found", HttpResponseEnum.NOT_FOUND),
  PRODUCT_NOT_IN_CART: () =>
    new AdapterError("Product not in cart", HttpResponseEnum.BAD_REQUEST),
  DATABASE_NOT_INITIALIZED: () =>
    new AdapterError(
      "Database not initialized",
      HttpResponseEnum.INTERNAL_SERVER_ERROR,
    ),
  PRODUCT_NOT_FOUND: () =>
    new AdapterError("Product not found", HttpResponseEnum.NOT_FOUND),
};
