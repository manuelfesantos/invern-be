import {
  SelectedShippingMethod,
  selectedShippingMethodSchema,
} from "@shipping-entity";
import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { validateCartId } from "@cart-db";
import { selectShippingMethods } from "@shipping-db";
import { decrypt } from "@crypto-utils";
import { getCartWeight } from "@cart-entity";

export const getShippingMethods = async (): Promise<{
  shippingMethods: SelectedShippingMethod[];
  selectedShippingMethod?: SelectedShippingMethod;
}> => {
  let selectedShippingMethodId: string | undefined;
  const { cartId, country, shippingMethodId } = contextStore.context;
  const cart = await validateCartId(cartId);

  if (shippingMethodId) {
    selectedShippingMethodId = await decrypt(shippingMethodId);
  }

  const weight = getCartWeight(cart);
  const shippingMethodsFromDb = await selectShippingMethods(weight);
  if (!shippingMethodsFromDb || !shippingMethodsFromDb.length) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }

  const shippingMethods = shippingMethodsFromDb.map((shippingMethod) => {
    const selectedRate = shippingMethod.rates.find(({ countryCodes }) =>
      countryCodes.includes(country.code),
    );
    if (!selectedRate) {
      throw errors.SHIPPING_RATE_NOT_FOUND();
    }
    return selectedShippingMethodSchema.parse({
      ...shippingMethod,
      rate: selectedRate,
    });
  });

  const selectedShippingMethod = shippingMethods.find(
    ({ id }) => id === selectedShippingMethodId,
  );

  return {
    shippingMethods,
    selectedShippingMethod,
  };
};
