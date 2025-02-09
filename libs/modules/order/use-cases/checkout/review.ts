import { UserDetails } from "@user-entity";
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
import { extendCart } from "@price-utils";

interface CheckoutReviewReturnType {
  personalDetails: UserDetails;
  address: Address;
  shippingMethod: SelectedShippingMethod;
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
    } = contextStore.context;
    const cart = await validateCartId(cartId);
    const weight = getCartWeight(cart);

    if (!addressString || !shippingMethodId || !userDetails) {
      throw errors.NOT_ALLOWED("Missing required data");
    }

    const shippingMethod = await getShippingMethod(
      await decrypt(shippingMethodId),
      weight,
    );
    const address = await decryptObjectString<Address>(addressString);
    const personalDetails = await decryptObjectString<UserDetails>(userDetails);
    const extendedCart = extendCart(toCartDTO(cart));
    const totalPrice =
      extendedCart.grossPrice + shippingMethod.rate.priceInCents;

    return {
      address,
      personalDetails,
      shippingMethod,
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
