import { createCheckoutSession } from "@stripe-adapter";
import { increaseProductsStock } from "@product-db";
import { errors } from "@error-handling-utils";
import {
  LineItem,
  lineItemSchema,
  productIdAndQuantityArraySchema,
} from "@product-entity";
import { validateCartId } from "@cart-db";
import { logger } from "@logger-utils";
import { decreaseProductsStock } from "@product-db";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stockClient } from "@r2-adapter";
import { stringifyObject } from "@string-utils";
import { MILLISECONDS_IN_SECOND } from "@timer-utils";
import { insertCheckoutSession } from "@checkout-session-db";
import { contextStore } from "@context-utils";
import { decrypt, decryptObjectString, encryptObject } from "@crypto-utils";
import { Country } from "@country-entity";
import { Address } from "@address-entity";
import { selectShippingMethod } from "@shipping-db";
import { getCartWeight } from "@cart-entity";
import { UserDetails, userDetailsSchema } from "@user-entity";
import { getUserById } from "@user-db";

interface CheckoutReturnType {
  url: string;
  checkoutSessionId: string;
}

export const getCheckoutSession = async (
  origin?: string,
): Promise<CheckoutReturnType> => {
  const { cartId, userId, address, country, shippingMethodId, userDetails } =
    contextStore.context;
  if (!cartId) {
    logger().error("No cart provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.CART_NOT_PROVIDED();
  }
  if (!address) {
    logger().error("No address provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.ADDRESS_NOT_PROVIDED();
  }
  if (!shippingMethodId) {
    logger().error("No shipping method provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.SHIPPING_METHOD_NOT_FOUND();
  }

  if (!userDetails && !userId) {
    logger().error("No user details provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.USER_DETAILS_NOT_PROVIDED();
  }

  await validateAddressCountry(address, country);

  const cart = await validateCartId(cartId);

  if (!cart?.products?.length) {
    throw errors.CART_IS_EMPTY();
  }

  const lineItems = cart.products.map((product) =>
    lineItemSchema.parse(product),
  );

  validateLineItems(lineItems);

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

  if (!shippingMethod.rates.length) {
    logger().error("No shipping rates provided", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.SHIPPING_RATE_NOT_FOUND();
  }

  let personalDetails: UserDetails;

  if (userDetails) {
    personalDetails = userDetailsSchema.parse(
      await decryptObjectString(userDetails),
    );
  } else {
    if (!userId) {
      throw errors.USER_DETAILS_NOT_PROVIDED();
    }
    const user = await getUserById(userId);
    if (!user) {
      throw errors.USER_NOT_FOUND();
    }
    personalDetails = userDetailsSchema.parse(user);
  }

  await reserveLineItems(lineItems);

  const session = await createCheckoutSession(
    lineItems,
    shippingMethod,
    origin,
  );

  const { url, expires_at, id, created } = session;

  if (!url) {
    throw new Error("Checkout session creation failed");
  }

  const [checkoutSession] = await insertCheckoutSession({
    id,
    userId: userId ?? null,
    cartId: cartId ?? null,
    expiresAt: expires_at,
    createdAt: new Date(
      (created || Date.now()) / MILLISECONDS_IN_SECOND,
    ).toISOString(),
    products: productIdAndQuantityArraySchema.parse(lineItems),
    shippingMethodId: shippingMethod.id,
    address: address,
    personalDetails: await encryptObject(personalDetails),
  });

  logger().info("Finished creating checkout session", {
    useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    data: {
      sessionDetails: stringifyObject(session),
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

const validateAddressCountry = async (
  address: string,
  country: Country,
): Promise<void> => {
  const parsedAddress = await decryptObjectString<Address>(address);
  if (parsedAddress.country !== country.code) {
    logger().error("Address country does not match the country of the user", {
      useCase: LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    });
    throw errors.ADDRESS_COUNTRY_MISMATCH();
  }
};
