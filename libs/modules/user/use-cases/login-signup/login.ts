import { getUserByEmail } from "@user-adapter";
import { generateErrorResponse, successResponse } from "@response-entity";
import { User, userToUserDTO } from "@user-entity";
import { errors } from "@error-handling-utils";
import { hash } from "@crypto-utils";
import { loginBodySchema } from "../../types/login-signup";
import { getCartById } from "@cart-adapter";

export const login = async (body: unknown): Promise<Response> => {
  try {
    const parsedBody = loginBodySchema.parse(body);

    const { email, password } = parsedBody;

    const user = await getUser(email);

    await validatePassword(password, user);

    user.cart = await getCartById(user.cart.cartId);

    return successResponse.OK("successfully logged in", userToUserDTO(user));
  } catch (error: any) {
    return generateErrorResponse(error);
  }
};

const getUser = async (email: string): Promise<User> => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw errors.INVALID_CREDENTIALS();
  }
  return user;
};

const validatePassword = async (
  passwordText: string,
  user: User,
): Promise<void> => {
  const passwordHash = await hash(passwordText, user.userId);
  if (passwordHash !== user.password) {
    throw errors.INVALID_CREDENTIALS();
  }
};
