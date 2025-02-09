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
import { decryptObjectString } from "@crypto-utils";
import { Country } from "@country-entity";
import { Address } from "@address-entity";

interface CheckoutReturnType {
  url: string;
  checkoutSessionId: string;
}

export const checkout = async (
  origin?: string,
): Promise<CheckoutReturnType> => {
  const { cartId, userId, address, country } = contextStore.context;
  if (!cartId) {
    logger().error(
      "No cart provided",
      LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    );
    throw errors.CART_NOT_PROVIDED();
  }
  if (!address) {
    logger().error(
      "No address provided",
      LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    );
    throw errors.ADDRESS_NOT_PROVIDED();
  }

  await validateAddressCountry(address, country);

  const lineItems = await getLineItemsByCartId(cartId);

  await reserveLineItems(lineItems);

  const session = await createCheckoutSession(lineItems, origin);

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
  });

  logger().info(
    "Finished creating checkout session",
    LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    {
      sessionDetails: stringifyObject(session),
      checkoutSession,
    },
  );

  return {
    url,
    checkoutSessionId: id,
  };
};

const getLineItemsByCartId = async (cartId: string): Promise<LineItem[]> => {
  const cart = await validateCartId(cartId);
  if (!cart?.products?.length) {
    throw errors.CART_IS_EMPTY();
  }
  const lineItems = cart.products.map((product) =>
    lineItemSchema.parse(product),
  );

  validateLineItems(lineItems);

  return lineItems;
};

const reserveLineItems = async (lineItems: LineItem[]): Promise<void> => {
  const updatedLineItems = await decreaseProductsStock(lineItems);
  try {
    for (const lineItem of updatedLineItems) {
      await stockClient.update(lineItem);
    }
  } catch (error) {
    const updatedProducts = await increaseProductsStock(lineItems);
    for (const product of updatedProducts) {
      await stockClient.update(product);
    }
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
    logger().error(
      "Address country does not match the country of the user",
      LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    );
    throw errors.ADDRESS_COUNTRY_MISMATCH();
  }
};
