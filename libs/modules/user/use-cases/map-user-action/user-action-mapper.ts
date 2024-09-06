import { login } from "./login";
import { signup } from "./signup";
import { userActionSchema } from "./types/map-user-action";
import { logout } from "./logout";

const userActionMap = {
  login,
  signup,
  logout,
};

export const userActionMapper = async (
  body: unknown,
  action: string | null,
  userId?: string,
): Promise<Response> => {
  const userAction = userActionSchema.parse(action);

  return userActionMap[userAction](body, userId);
};
