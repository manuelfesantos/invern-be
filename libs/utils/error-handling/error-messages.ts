import { CustomError } from "./custom-error";
import { HttpStatusEnum } from "@http-entity";

export const errors = {
  GENERIC: (errorMessage?: string): CustomError =>
    new CustomError(
      errorMessage ?? "Something went wrong",
      HttpStatusEnum.INTERNAL_SERVER_ERROR,
    ),
  COUNTRY_NOT_FOUND: (): CustomError =>
    new CustomError("Country not found", HttpStatusEnum.NOT_FOUND),
  CURRENCY_NOT_FOUND: (): CustomError =>
    new CustomError("Currency not found", HttpStatusEnum.NOT_FOUND),
  EMAIL_ALREADY_TAKEN: (): CustomError =>
    new CustomError("Email already taken", HttpStatusEnum.CONFLICT),
  INVALID_CREDENTIALS: (): CustomError =>
    new CustomError(
      "Invalid username or password",
      HttpStatusEnum.UNAUTHORIZED,
    ),
  USER_NOT_FOUND: (errorMessage?: string): CustomError =>
    new CustomError(errorMessage ?? "User not found", HttpStatusEnum.NOT_FOUND),
  USER_DETAILS_NOT_PROVIDED: (): CustomError =>
    new CustomError("User details not provided", HttpStatusEnum.BAD_REQUEST),
  PASSWORD_UPDATE_FAILED: (): CustomError =>
    new CustomError(
      "Password update failed",
      HttpStatusEnum.INTERNAL_SERVER_ERROR,
    ),
  PASSWORD_REQUIRED: (): CustomError =>
    new CustomError("Password is required", HttpStatusEnum.BAD_REQUEST),
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
        ? `Not enough stock available for this product. Only ${stock} in stock.`
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
  INVALID_PRODUCT_QUANTITY: (): CustomError =>
    new CustomError(`Invalid product quantity`, HttpStatusEnum.BAD_REQUEST),
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
  MISSING_CHECKOUT_SESSION_PRODUCTS: (): CustomError =>
    new CustomError(
      "Missing products in checkout session",
      HttpStatusEnum.INTERNAL_SERVER_ERROR,
    ),
  PRODUCTS_ARE_REQUIRED: (): CustomError =>
    new CustomError("Products are required", HttpStatusEnum.BAD_REQUEST),
  CART_IS_EMPTY: (): CustomError =>
    new CustomError("Cart is empty", HttpStatusEnum.CONFLICT),
  CART_HAS_ISSUES: (issues: string[]): CustomError =>
    new CustomError(
      `Cart has issues: ${issues.join(", ")}`,
      HttpStatusEnum.BAD_REQUEST,
    ),
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
  NO_EMAIL_PROVIDED_WHILE_GETTING_ORDER: (): CustomError =>
    new CustomError(
      "Missing email for order fetching",
      HttpStatusEnum.UNPROCESSABLE_ENTITY,
    ),
  SHIPPING_METHOD_NOT_FOUND: (): CustomError =>
    new CustomError("Shipping method not found", HttpStatusEnum.NOT_FOUND),
  SHIPPING_METHOD_HAS_RATES: (): CustomError =>
    new CustomError(
      "Shipping method has rates; delete or reassign its rates first",
      HttpStatusEnum.CONFLICT,
    ),
  SHIPPING_RATE_NOT_FOUND: (): CustomError =>
    new CustomError("Shipping rate not found", HttpStatusEnum.NOT_FOUND),
  UNAUTHORIZED: (message?: string): CustomError =>
    new CustomError(message || "Unauthorized", HttpStatusEnum.UNAUTHORIZED),
  NOT_ALLOWED: (message?: string): CustomError =>
    new CustomError(message || "Not allowed", HttpStatusEnum.FORBIDDEN),
  UNABLE_TO_PARSE_BODY: (): CustomError =>
    new CustomError("Unable to parse body", HttpStatusEnum.BAD_REQUEST),
  FORGOT_SECRET_NOT_FOUND: (): CustomError =>
    new CustomError("Verification code not found", HttpStatusEnum.NOT_FOUND),
  NEW_EMAIL_SECRET_NOT_FOUND: (): CustomError =>
    new CustomError(
      "New email verification code not found",
      HttpStatusEnum.NOT_FOUND,
    ),
  INVALID_FORGOT_SECRET: (): CustomError =>
    new CustomError("Invalid verification code", HttpStatusEnum.UNAUTHORIZED),
  FORGOT_SECRET_EXPIRED: (): CustomError =>
    new CustomError("Verification code expired", HttpStatusEnum.UNAUTHORIZED),
  FORGOT_SECRET_EXHAUSTED: (waitingMinutes: number): CustomError =>
    new CustomError(
      `Verification code exhausted. Please try again in ${waitingMinutes} minutes`,
      HttpStatusEnum.UNAUTHORIZED,
    ),
  INVALID_VALIDATION_CODE: (message?: string): CustomError =>
    new CustomError(
      message || "Invalid validation code",
      HttpStatusEnum.UNAUTHORIZED,
    ),
  VALIDATION_CODE_EXPIRED: (): CustomError =>
    new CustomError("Validation code expired", HttpStatusEnum.UNAUTHORIZED),
  VALIDATION_CODE_NOT_FOUND: (): CustomError =>
    new CustomError("Validation code not found", HttpStatusEnum.NOT_FOUND),
};
