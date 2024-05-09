import { User, userWithoutCartSchema } from "@user-entity";
import { errors } from "@error-handling-utils";
import { prepareStatement } from "@db-utils";
import { cartSchema } from "@cart-entity";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await prepareStatement(
    `SELECT * FROM users WHERE email = '${email}'`,
  ).first();
  return getUserFromResult(result);
};

export const getUserById = async (id: string): Promise<User> => {
  const result = await prepareStatement(
    `SELECT * FROM users WHERE userId = '${id}'`,
  ).first();

  const user = getUserFromResult(result);

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  return user;
};

const getUserFromResult = (
  result: Record<string, unknown> | null,
): User | null => {
  return result
    ? {
        ...userWithoutCartSchema.parse(result),
        cart: cartSchema.parse({
          cartId: result.cartId,
          products: [],
        }),
      }
    : null;
};
