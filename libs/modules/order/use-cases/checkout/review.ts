import type { UserDetails} from "@user-entity";
import { userDetailsSchema } from "@user-entity";
import type { Address } from "@address-entity";
import type {
  SelectedShippingMethod} from "@shipping-entity";
import {
  selectedShippingMethodSchema,
} from "@shipping-entity";
import type { ExtendedCart} from "@cart-entity";
import { getCartWeight, toCartDTO } from "@cart-entity";
import { contextStore } from "@context-utils";
import { validateCartId } from "@cart-db";
import { getSelectShippingMethodAction } from "@shipping-db";
import { errors } from "@error-handling-utils";
import { decrypt, decryptObjectString } from "@crypto-utils";
import { extendCart } from "@extender-utils";
import { getSelectUserByIdAction } from "@user-db";

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
      const user = await getSelectUserByIdAction(userId).run();
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
  const shippingMethod = await getSelectShippingMethodAction(
    shippingMethodId,
    weight,
  ).run();
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
