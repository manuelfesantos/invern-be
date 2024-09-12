import { checkoutBodySchema } from "./types/checkout";
import { createCheckoutSession } from "@stripe-adapter";
import {
  ProtectedModuleFunction,
  protectedSuccessResponse,
} from "@response-entity";
import { getProductsByProductIds } from "@product-db";
import { errors } from "@error-handling-utils";
import { Product, LineItem, lineItemSchema } from "@product-entity";
import { getCartById, validateCartId } from "@cart-db";
import { getLogger } from "@logger-utils";
import { decreaseProductsStock } from "@product-db";
import { uuidSchema } from "@global-entity";

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
      throw errors.PRODUCTS_ARE_REQUIRED();
    }
    const { products } = checkoutBodySchema.parse(body);
    lineItems = await getLineItems(products);
  }

  await reserveLineItems(lineItems);

  const session = await createCheckoutSession(lineItems, userId, cartId);

  getLogger().addData({ sessionDetails: session });

  const { url } = session;

  if (!url) {
    throw errors.CHECKOUT_SESSION_CREATION_FAILED();
  }

  return protectedSuccessResponse.OK(
    tokens,
    "checkout session created",
    {
      url,
    },
    remember,
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
  await decreaseProductsStock(lineItems);
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
