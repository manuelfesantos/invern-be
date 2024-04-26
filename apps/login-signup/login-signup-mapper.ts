import { errorResponse } from "@entities/response/error-response";
import { login } from "@apps/login-signup/login";
import { signup } from "@apps/login-signup/signup";

export const loginSignupMapper = async (
  body: unknown,
  action: string | null,
) => {
  if (!action) {
    return errorResponse.BAD_REQUEST("action is required");
  }
  if (action === "login") {
    return await login(body);
  }
  if (action === "signup") {
    return await signup(body);
  }
  return errorResponse.BAD_REQUEST("invalid action");
};
