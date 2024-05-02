import { User, userSchema } from "@user-entity";
import { errors } from "@error-handling-utils";
import { prepareStatement } from "@db-adapter";
import { cartSchema } from "@cart-entity";

export const getUserByEmail = async (email: string) => {
  const result = await prepareStatement(
    `SELECT * FROM users WHERE users.email = '${email}'`,
  ).first();
  return getUserFromResult(result);
};

export const getUserById = async (id: string) => {
  const user = await prepareStatement(
    `SELECT * FROM users WHERE userId = '${id}'`,
  ).first<User>();

  if (!user) {
    throw errors.USER_NOT_FOUND();
  }

  return user;
};

const getUserFromResult = (result: Record<string, unknown> | null) => {
  return result
    ? {
        ...userSchema.parse(result),
        cart: cartSchema.parse({
          cartId: result.cartId,
          products: [],
        }),
      }
    : null;
};
