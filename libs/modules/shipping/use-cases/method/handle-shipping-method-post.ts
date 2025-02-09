import {
  SelectedShippingMethod,
  selectedShippingMethodSchema,
} from "@shipping-entity";
import { z } from "zod";
import { contextStore } from "@context-utils";
import { selectShippingMethod } from "@shipping-db";
import { validateCartId } from "@cart-db";
import { errors } from "@error-handling-utils";
import { encrypt } from "@crypto-utils";
import { requiredStringSchema } from "@global-entity";
import { getCartWeight } from "@cart-entity";

const shippingMethodPostBodySchema = z.object({
  id: requiredStringSchema("shipping method id"),
});

export const handleShippingMethodPost = async (
  body: unknown,
): Promise<{
  shippingMethod: SelectedShippingMethod;
  encryptedShippingMethodId: string;
}> => {
  const { country, cartId } = contextStore.context;
  const { id } = shippingMethodPostBodySchema.parse(body);
  const cart = await validateCartId(cartId);
  const weight = getCartWeight(cart);
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
    encryptedShippingMethodId: await encrypt(shippingMethod.id),
  };
};
