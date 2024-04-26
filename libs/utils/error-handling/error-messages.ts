import { AdapterError } from "@utils/error-handling/adapter-error";

export const errors = {
  EMAIL_ALREADY_TAKEN: new AdapterError("Email already taken", 409),
  INVALID_CREDENTIALS: new AdapterError("Invalid username or password", 400),
  USER_NOT_FOUND: new AdapterError("User not found", 404),
};
