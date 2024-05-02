import { login } from "./login";
import { signup } from "./signup";
import { errorResponse } from "@response-entity";

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
