import { login } from "./login";
import { signup } from "./signup";
import { errors } from "@error-handling-utils";

export const loginSignupMapper = async (
  body: unknown,
  action: string | null,
): Promise<Response> => {
  if (!action) {
    throw errors.ACTION_IS_REQUIRED();
  }
  if (action === "login") {
    return await login(body);
  }
  if (action === "signup") {
    return await signup(body);
  }
  throw errors.INVALID_ACTION(action);
};
