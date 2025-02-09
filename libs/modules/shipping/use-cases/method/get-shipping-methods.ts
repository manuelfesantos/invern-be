import {
  SelectedShippingMethod,
  selectedShippingMethodSchema,
} from "@shipping-entity";
import { contextStore } from "@context-utils";
import { errors } from "@error-handling-utils";
import { validateCartId } from "@cart-db";
import { toTotalWeight } from "@product-entity";
import { selectShippingMethods } from "@shipping-db";
import { decryptObjectString } from "@crypto-utils";

const NO_WEIGHT = 0;

export const getShippingMethods = async (): Promise<{
  shippingMethods: SelectedShippingMethod[];
  selectedShippingMethod?: SelectedShippingMethod;
}> => {
  let selectedShippingMethod: SelectedShippingMethod | undefined;
  const { cartId, country, shippingMethod } = contextStore.context;
  const cart = await validateCartId(cartId);

  if (shippingMethod) {
    selectedShippingMethod =
      await decryptObjectString<SelectedShippingMethod>(shippingMethod);
  }

  const weight = cart.products?.reduce(toTotalWeight, NO_WEIGHT);
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

  return {
    shippingMethods,
    selectedShippingMethod,
  };
};
