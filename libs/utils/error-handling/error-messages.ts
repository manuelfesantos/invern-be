import { AdapterError } from "./adapter-error";
import { HttpResponseEnum } from "@entities/http/http-response";

export const errors = {
  EMAIL_ALREADY_TAKEN: new AdapterError(
    "Email already taken",
    HttpResponseEnum.CONFLICT,
  ),
  INVALID_CREDENTIALS: new AdapterError(
    "Invalid username or password",
    HttpResponseEnum.UNAUTHORIZED,
  ),
  USER_NOT_FOUND: new AdapterError(
    "User not found",
    HttpResponseEnum.NOT_FOUND,
  ),
};
