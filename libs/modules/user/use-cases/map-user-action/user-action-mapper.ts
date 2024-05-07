import { login } from "./login";
import { signup } from "./signup";
import { userActionSchema } from "./types/map-user-action";
import { authenticate } from "./authenticate";

const userActionMap = {
  login,
  signup,
  authenticate,
};

export const userActionMapper = async (
  body: unknown,
  action: string | null,
): Promise<Response> => {
  const userAction = userActionSchema.parse(action);

  return userActionMap[userAction](body);
};
