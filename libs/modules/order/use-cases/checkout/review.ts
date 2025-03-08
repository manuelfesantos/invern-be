import { UserDetails, userDetailsSchema } from "@user-entity";
import { Address } from "@address-entity";
import {
  SelectedShippingMethod,
  selectedShippingMethodSchema,
} from "@shipping-entity";
import { ExtendedCart, getCartWeight, toCartDTO } from "@cart-entity";
import { contextStore } from "@context-utils";
import { validateCartId } from "@cart-db";
import { selectShippingMethod } from "@shipping-db";
import { errors } from "@error-handling-utils";
import { decrypt, decryptObjectString } from "@crypto-utils";
import { extendCart } from "@extender-utils";
import { getUserById } from "@user-db";

interface IsEditable {
  isEditable: boolean;
}

interface CheckoutReviewReturnType {
  personalDetails: UserDetails & IsEditable;
  address: Address & IsEditable;
  shippingMethod: SelectedShippingMethod & IsEditable;
  cart: ExtendedCart;
  totalPrice: number;
}

export const getCheckoutReview =
  async (): Promise<CheckoutReviewReturnType> => {
    const {
      address: addressString,
      userDetails,
      shippingMethodId,
      cartId,
      userId,
    } = contextStore.context;

    let personalDetails: UserDetails | undefined = undefined;
    const cart = await validateCartId(cartId);
    const weight = getCartWeight(cart);

    if (userDetails) {
      personalDetails = await decryptObjectString<UserDetails>(userDetails);
    } else {
      if (!userId) {
        throw errors.NOT_ALLOWED("Missing personal details");
      }
      const user = await getUserById(userId);
      personalDetails = userDetailsSchema.parse(user);
    }

    if (!addressString) {
      throw errors.NOT_ALLOWED("Missing address");
    }
    if (!shippingMethodId) {
      throw errors.NOT_ALLOWED("Missing shipping method");
    }

    const shippingMethod = await getShippingMethod(
      await decrypt(shippingMethodId),
      weight,
    );
    const address = await decryptObjectString<Address>(addressString);
    const extendedCart = extendCart(toCartDTO(cart));
    const totalPrice =
      extendedCart.grossPrice + shippingMethod.rate.priceInCents;

    return {
      address: { ...address, isEditable: true },
      personalDetails: { ...personalDetails, isEditable: !userId },
      shippingMethod: { ...shippingMethod, isEditable: true },
      cart: extendedCart,
      totalPrice,
    };
  };

const getShippingMethod = async (
  shippingMethodId: string,
  weight: number,
): Promise<SelectedShippingMethod> => {
  const shippingMethod = await selectShippingMethod(shippingMethodId, weight);
  if (!shippingMethod) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }
  if (!shippingMethod.rates.length) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }
  return selectedShippingMethodSchema.parse({
    ...shippingMethod,
    rate: shippingMethod.rates.find(({ countryCodes }) =>
      countryCodes.includes(contextStore.context.country.code),
    ),
  });
};
