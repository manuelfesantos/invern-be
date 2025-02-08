import { login } from "./login";
import { signup } from "./signup";
import {
  UserActionReturnType,
  userActionSchema,
} from "./types/map-user-action";
import { logout } from "./logout";

const userActionMap = {
  login,
  signup,
  logout,
};

export const userActionMapper = async (
  body: unknown,
  action: string | null,
): Promise<UserActionReturnType> => {
  const userAction = userActionSchema.parse(action);

  return userActionMap[userAction](body);
};
