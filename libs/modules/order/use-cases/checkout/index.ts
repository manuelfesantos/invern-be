import { createStripeCheckoutSession } from "@stripe-adapter";
import { increaseProductsStock } from "@product-db";
import { errors } from "@error-handling-utils";
import { LineItem, lineItemSchema } from "@product-entity";
import { validateCartId } from "@cart-db";
import { logger } from "@logger-utils";
import { decreaseProductsStock } from "@product-db";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stockClient } from "@r2-adapter";
import { stringifyObject } from "@string-utils";
import { getDateTime, MILLISECONDS_IN_SECOND } from "@timer-utils";
import { insertCheckoutSession } from "@checkout-session-db";
import { contextStore } from "@context-utils";
import { decrypt, decryptObjectString, getRandomUUID } from "@crypto-utils";
import { Country } from "@country-entity";
import { Address } from "@address-entity";
import { selectShippingMethod } from "@shipping-db";
import { Cart, FilledCart, getCartWeight } from "@cart-entity";
import { UserDetails, userDetailsSchema } from "@user-entity";
import { getUserById } from "@user-db";
import { SelectedShippingMethod } from "@shipping-entity";
import {
  CheckoutSession,
  insertCheckoutSessionSchema,
} from "@checkout-session-entity";

interface CheckoutReturnType {
  url: string;
  checkoutSessionId: string;
}

export const getCheckoutSession = async (
  origin?: string,
): Promise<CheckoutReturnType> => {
  const {
    cartId,
    userId,
    address: addressString,
    country,
    shippingMethodId,
    userDetails,
  } = contextStore.context;

  const address = await getValidatedAddressFromString(country, addressString);

  const cart = await getValidatedCart(cartId);

  const personalDetails = await getPersonalDetails(userId, userDetails);

  const selectedShippingMethod = await getSelectedShippingMethod(
    cart,
    country,
    shippingMethodId,
  );

  await reserveLineItems(cart.products);

  const orderId = getRandomUUID();

  const stripeCheckoutSession = await createStripeCheckoutSession(
    cart.products,
    selectedShippingMethod,
    orderId,
    origin,
  );

  const { url, expires_at, id, created } = stripeCheckoutSession;

  if (!url) {
    throw new Error("Checkout session creation failed");
  }

  const newCheckoutSession: CheckoutSession = {
    id,
    orderId,
    userId: userId ?? null,
    cartId: cartId ?? null,
    expiresAt: getDateTime(expires_at * MILLISECONDS_IN_SECOND),
    createdAt: getDateTime(created * MILLISECONDS_IN_SECOND),
    products: cart.products,
    shippingMethod: selectedShippingMethod,
    address: address,
    personalDetails: personalDetails,
    country: country,
  };

  const [checkoutSession] = await insertCheckoutSession(
    insertCheckoutSessionSchema.parse(newCheckoutSession),
  );

  logger().info("Finished creating checkout session", {
    useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    data: {
      sessionDetails: stringifyObject(stripeCheckoutSession),
      checkoutSession,
    },
  });

  return {
    url,
    checkoutSessionId: id,
  };
};

const reserveLineItems = async (lineItems: LineItem[]): Promise<void> => {
  const updatedLineItems = await decreaseProductsStock(lineItems);
  try {
    await stockClient.updateMany(updatedLineItems);
  } catch (error) {
    const updatedProducts = await increaseProductsStock(lineItems);
    await stockClient.updateMany(updatedProducts);
  }
};

const getValidatedAddressFromString = async (
  country: Country,
  addressString?: string,
): Promise<Address> => {
  if (!addressString) {
    logger().error("No address provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.ADDRESS_NOT_PROVIDED();
  }

  const address = await decryptObjectString<Address>(addressString);

  if (address.country !== country.code) {
    logger().error("Address country does not match the country of the user", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.ADDRESS_COUNTRY_MISMATCH();
  }
  return address;
};

const getValidatedCart = async (cartId?: string): Promise<FilledCart> => {
  const cart = await validateCartId(cartId);

  if (!cart.products || !cart.products.length) {
    throw errors.CART_IS_EMPTY();
  }

  const lineItems = cart.products.map((product) =>
    lineItemSchema.parse(product),
  );

  validateLineItems(lineItems);

  return { ...cart, products: lineItems };
};

const validateLineItems = (lineItems: LineItem[]): void => {
  const productsOutOfStock: { productId: string; stock: number }[] = [];

  lineItems.forEach((lineItem) => {
    if (!lineItem.stock || lineItem.quantity > lineItem.stock) {
      productsOutOfStock.push({
        productId: lineItem.id,
        stock: lineItem.stock,
      });
    }
  });

  if (productsOutOfStock.length) {
    throw errors.PRODUCTS_OUT_OF_STOCK(productsOutOfStock);
  }
};

const getPersonalDetails = async (
  userId?: string,
  userDetails?: string,
): Promise<UserDetails> => {
  if (!userDetails && !userId) {
    logger().error("No user details provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.USER_DETAILS_NOT_PROVIDED();
  }

  if (userDetails) {
    return userDetailsSchema.parse(await decryptObjectString(userDetails));
  } else {
    if (!userId) {
      throw errors.USER_DETAILS_NOT_PROVIDED();
    }
    const user = await getUserById(userId);
    if (!user) {
      throw errors.USER_NOT_FOUND();
    }

    return userDetailsSchema.parse(user);
  }
};

const getSelectedShippingMethod = async (
  cart: Cart,
  country: Country,
  shippingMethodId?: string,
): Promise<SelectedShippingMethod> => {
  if (!shippingMethodId) {
    logger().error("No shipping method provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }

  const shippingMethod = await selectShippingMethod(
    await decrypt(shippingMethodId),
    getCartWeight(cart),
  );

  if (!shippingMethod) {
    logger().error("No shipping method provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }

  const selectedShippingRate = shippingMethod.rates.find((rate) =>
    rate.countryCodes.includes(country.code),
  );

  if (!selectedShippingRate) {
    logger().error("No shipping rates provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  return {
    ...shippingMethod,
    rate: selectedShippingRate,
  };
};
