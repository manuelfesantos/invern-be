import {
  SelectedShippingMethod,
  selectedShippingMethodSchema,
} from "@shipping-entity";
import { z } from "zod";
import { contextStore } from "@context-utils";
import { selectShippingMethod } from "@shipping-db";
import { validateCartId } from "@cart-db";
import { errors } from "@error-handling-utils";
import { toTotalWeight } from "@product-entity";
import { encryptObject } from "@crypto-utils";
import { requiredStringSchema } from "@global-entity";

const NO_WEIGHT = 0;

const shippingMethodPostBodySchema = z.object({
  id: requiredStringSchema("shipping method id"),
});

export const handleShippingMethodPost = async (
  body: unknown,
): Promise<{
  shippingMethod: SelectedShippingMethod;
  encryptedShippingMethod: string;
}> => {
  const { country, cartId } = contextStore.context;
  const { id } = shippingMethodPostBodySchema.parse(body);
  const cart = await validateCartId(cartId);
  const weight = cart.products?.reduce(toTotalWeight, NO_WEIGHT);
  const shippingMethod = await selectShippingMethod(id, weight);
  if (!shippingMethod) {
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }
  if (!shippingMethod.rates.length) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  const selectedRate = shippingMethod.rates.find(({ countryCodes }) =>
    countryCodes.includes(country.code),
  );

  if (!selectedRate) {
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  const selectedShippingMethod: SelectedShippingMethod = {
    ...shippingMethod,
    rate: selectedRate,
  };

  return {
    shippingMethod: selectedShippingMethodSchema.parse(selectedShippingMethod),
    encryptedShippingMethod: await encryptObject(selectedShippingMethod),
  };
};
