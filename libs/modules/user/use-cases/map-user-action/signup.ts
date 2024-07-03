import { signupBodySchema } from "./types/map-user-action";
import { insertUser, getUserByEmail, getUserById } from "@user-db";
import { insertCart } from "@cart-db";
import { successResponse } from "@response-entity";
import { errors } from "@error-handling-utils";
import { userToUserDTO } from "@user-entity";

export const signup = async (body: unknown): Promise<Response> => {
  const parsedBody = signupBodySchema.parse(body);

  await validateThatEmailIsUnique(parsedBody.email);
  const [{ cartId }] = await insertCart();
  const [{ userId }] = await insertUser({ ...parsedBody, cartId });
  const user = await getUserById(userId);

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  return successResponse.CREATED("user created", userToUserDTO(user));
};

const validateThatEmailIsUnique = async (email: string): Promise<void> => {
  const userExists = Boolean(await getUserByEmail(email));
  if (userExists) {
    throw errors.EMAIL_ALREADY_TAKEN();
  }
};
