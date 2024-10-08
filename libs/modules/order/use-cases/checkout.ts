import { checkoutBodySchema } from "./types/checkout";
import { createCheckoutSession } from "@stripe-adapter";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { getProductsByProductIds, increaseProductsStock } from "@product-db";
import { errors } from "@error-handling-utils";
import {
  Product,
  LineItem,
  lineItemSchema,
  productIdAndQuantityArraySchema,
} from "@product-entity";
import { getCartById, validateCartId } from "@cart-db";
import { logger } from "@logger-utils";
import { decreaseProductsStock } from "@product-db";
import { uuidSchema } from "@global-entity";
import { LoggerUseCaseEnum } from "@logger-entity";
import { stockClient } from "@r2-adapter";
import { stringifyObject } from "@string-utils";
import { base64Encode } from "@crypto-utils";
import { getCookieHeader } from "@http-utils";
import { MILLISECONDS_IN_SECOND, SESSION_EXPIRY } from "@timer-utils";
import { insertCheckoutSession } from "@checkout-session-db";

export const checkout: ProtectedModuleFunction = async (
  tokens,
  remember,
  userId?: string,
  cartId?: string,
  body?: unknown,
): Promise<Response> => {
  let lineItems: LineItem[] = [];

  if (cartId) {
    lineItems = await getLineItemsByCartId(cartId);
  } else {
    if (!body) {
      logger().error(
        "Checkout body not provided",
        LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
      );
      throw errors.PRODUCTS_ARE_REQUIRED();
    }
    const { products } = checkoutBodySchema.parse(body);
    lineItems = await getLineItems(products);
  }

  await reserveLineItems(lineItems);

  const session = await createCheckoutSession(lineItems);

  const { url, expires_at, id, created } = session;

  if (!url) {
    throw new Error("Checkout session creation failed");
  }

  const [checkoutSession] = await insertCheckoutSession({
    checkoutSessionId: id,
    userId: userId ?? null,
    cartId: cartId ?? null,
    expiresAt: expires_at,
    createdAt: new Date(
      (created || Date.now()) / MILLISECONDS_IN_SECOND,
    ).toISOString(),
    products: productIdAndQuantityArraySchema.parse(lineItems),
  });

  logger().info(
    "checkout session created",
    LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    { checkoutSession },
  );

  const checkoutSessionToken = base64Encode(id);

  const checkoutSessionCookie = getCookieHeader(
    "c_s",
    checkoutSessionToken,
    SESSION_EXPIRY,
  );

  logger().info(
    "Finished creating checkout session",
    LoggerUseCaseEnum.CREATE_CHECKOUT_SESSION,
    {
      sessionDetails: stringifyObject(session),
    },
  );

  return protectedSuccessResponse.OK(
    tokens,
    "checkout session created",
    {
      url,
    },
    remember,
    {
      "Set-Cookie": checkoutSessionCookie,
    },
  );
};

const getLineItemsByCartId = async (cartId: string): Promise<LineItem[]> => {
  await validateCartId(cartId);
  const cart = await getCartById(cartId);
  if (!cart.products?.length) {
    throw errors.CART_IS_EMPTY();
  }
  const lineItems = cart.products.map((product) =>
    lineItemSchema.parse(product),
  );

  validateLineItems(lineItems);

  return lineItems;
};

const getLineItems = async (
  products: { productId: string; quantity: number }[],
): Promise<LineItem[]> => {
  const dbProducts = await getProductsByProductIds(
    products.map((product) =>
      uuidSchema("product id").parse(product.productId),
    ),
  );
  if (dbProducts.length !== products.length) {
    throw errors.INVALID_PRODUCT_IDS(
      getInvalidProductIds(products, dbProducts),
    );
  }

  const lineItems = buildLineItems(products, dbProducts);

  validateLineItems(lineItems);

  return lineItems;
};

const getInvalidProductIds = (
  products: { productId: string; quantity: number }[],
  dbProducts: Product[],
): string[] => {
  return products
    .filter(
      (product) =>
        !dbProducts.find(
          (dbProduct) => dbProduct.productId === product.productId,
        ),
    )
    .map((product) => product.productId);
};

const buildLineItems = (
  products: { productId: string; quantity: number }[],
  dbProducts: Product[],
): LineItem[] => {
  return products.map((product) => ({
    ...dbProducts.find(
      (dbProduct) => dbProduct.productId === product.productId,
    )!,
    quantity: product.quantity,
  }));
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
        productId: lineItem.productId,
        stock: lineItem.stock,
      });
    }
  });

  if (productsOutOfStock.length) {
    throw errors.PRODUCTS_OUT_OF_STOCK(productsOutOfStock);
  }
};
