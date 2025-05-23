import { getSelectUserByEmailAction, getUpdateUserAction } from "@user-db";
import { toUserDTO, UserDTO, ValidateEmailSecretBody } from "@user-entity";
import { errors } from "@error-handling-utils";
import { getLoggedInRefreshToken, getLoggedInToken } from "@jwt-utils";
import { getAuthSecret, setAuthSecret } from "@kv-adapter";
import { extendCart } from "@extender-utils";
import { EMPTY_CART, ExtendedCart, toCartDTO } from "@cart-entity";

interface ReturnType {
  user: UserDTO;
  responseContext: {
    accessToken: string;
    refreshToken: string;
    remember: boolean;
  };
  cart: ExtendedCart;
}

export const validateUser = async (
  email: string,
  secret: ValidateEmailSecretBody,
): Promise<ReturnType> => {
  const user = await getSelectUserByEmailAction(email).run();
  if (!user) throw errors.USER_NOT_FOUND();

  if (!user.isValidated) {
    await getUpdateUserAction(user.id, { isValidated: true }).run();
  }

  const accessToken = await getLoggedInToken(user.id, user.cart?.id);
  let refreshToken = await getAuthSecret(user.id);

  if (!refreshToken) {
    refreshToken = await getLoggedInRefreshToken(user.id);
    await setAuthSecret(user.id, refreshToken);
  }

  return {
    user: toUserDTO(user),
    cart: extendCart(toCartDTO(user.cart ?? EMPTY_CART)),
    responseContext: {
      accessToken,
      refreshToken,
      remember: secret.remember,
    },
  };
};
