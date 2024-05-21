import { checkoutBodySchema } from "./types/checkout";
import { createCheckoutSession } from "@stripe-adapter";
import { successResponse } from "@response-entity";
import { getProducts } from "@product-adapter";
import { errors } from "@error-handling-utils";
import {
  Product,
  ProductWithQuantity,
  productWithQuantitySchema,
} from "@product-entity";
import { getCartById, validateCartId } from "@cart-adapter";

export const checkout = async (
  cartId: string | null,
  body?: unknown,
): Promise<Response> => {
  let checkoutProducts: ProductWithQuantity[] = [];
  if (cartId) {
    checkoutProducts = await getCheckoutProductsByCartId(cartId);
  } else {
    if (!body) {
      throw errors.PRODUCTS_ARE_REQUIRED();
    }
    const { products } = checkoutBodySchema.parse(body);
    checkoutProducts = await getCheckoutProducts(products);
  }

  const session = await createCheckoutSession(checkoutProducts);
  return buildRedirectResponse(session.url);
};

const getCheckoutProductsByCartId = async (
  cartId: string,
): Promise<ProductWithQuantity[]> => {
  await validateCartId(cartId);
  const cart = await getCartById(cartId);
  if (!cart.products.length) {
    throw errors.CART_IS_EMPTY();
  }
  return cart.products.map((product) =>
    productWithQuantitySchema.parse(product),
  );
};

const getCheckoutProducts = async (
  products: { productId: string; quantity: number }[],
): Promise<ProductWithQuantity[]> => {
  const dbProducts = await getProducts(
    null,
    products.map((product) => product.productId),
  );
  if (dbProducts.length !== products.length) {
    throw errors.INVALID_PRODUCT_IDS(
      getInvalidProductIds(products, dbProducts),
    );
  }
  return getProductsWithQuantity(products, dbProducts);
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

const getProductsWithQuantity = (
  products: { productId: string; quantity: number }[],
  dbProducts: Product[],
): ProductWithQuantity[] => {
  return products.map((product) => ({
    ...dbProducts.find(
      (dbProduct) => dbProduct.productId === product.productId,
    )!,
    quantity: product.quantity,
  }));
};

const buildRedirectResponse = (url: string | null): Response => {
  if (!url) {
    throw errors.CHECKOUT_SESSION_CREATION_FAILED();
  }
  return successResponse.OK("checkout session created", { url });
};
