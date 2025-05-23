import {
  SelectedShippingMethod,
  selectedShippingMethodSchema,
} from "@shipping-entity";
import { z } from "zod";
import { contextStore } from "@context-utils";
import { getSelectShippingMethodAction } from "@shipping-db";
import { validateCartId } from "@cart-db";
import { errors } from "@error-handling-utils";
import { encrypt } from "@crypto-utils";
import { requiredStringSchema } from "@global-entity";
import { getCartWeight, toCartDTO } from "@cart-entity";
import { extendCart } from "@extender-utils";

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

  if (!cart.products?.length) {
    throw errors.CART_IS_EMPTY();
  }

  const extendedCart = extendCart(toCartDTO(cart));

  if (extendedCart.issues && extendedCart.issues.length) {
    throw errors.CART_HAS_ISSUES(extendedCart.issues);
  }

  const weight = getCartWeight(cart);
  const shippingMethod = await getSelectShippingMethodAction(id, weight).run();
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
