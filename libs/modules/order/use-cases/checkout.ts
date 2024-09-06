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
  return cart.products.map((product) => lineItemSchema.parse(product));
};

const getLineItems = async (
  products: { productId: string; quantity: number }[],
): Promise<LineItem[]> => {
  const dbProducts = await getProductsByProductIds(
    products.map((product) => product.productId),
  );
  if (dbProducts.length !== products.length) {
    throw errors.INVALID_PRODUCT_IDS(
      getInvalidProductIds(products, dbProducts),
    );
  }
  return buildLineItems(products, dbProducts);
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
