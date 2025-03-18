import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { errors } from "@error-handling-utils";
import { Product } from "@product-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";

const NO_QUANTITY = 0;

export const patchCartItemQuantityInDb = async (
  cartId: string,
  product: Product,
  quantity: number,
): Promise<void> => {
  if (quantity === NO_QUANTITY) return;

  const cartQuantity = await getProductQuantityInCart(product.id, cartId);

  const finalQuantity = cartQuantity + quantity;

  const shouldInsertProduct = !cartQuantity && finalQuantity > NO_QUANTITY;
  const shouldUpdateProduct = cartQuantity && finalQuantity > NO_QUANTITY;
  const shouldDeleteProduct = cartQuantity && finalQuantity <= NO_QUANTITY;
  const invalidCase = !cartQuantity && finalQuantity <= NO_QUANTITY;
  const notEnoughStock =
    quantity > NO_QUANTITY && product.stock < finalQuantity;

  if (notEnoughStock) {
    throw errors.PRODUCT_OUT_OF_STOCK(product.stock);
  }

  if (invalidCase) {
    throw errors.PRODUCT_NOT_IN_CART();
  }

  if (shouldInsertProduct) {
    await insertProductInCart(product.id, cartId, finalQuantity);
  } else if (shouldDeleteProduct) {
    await deleteProductFromCart(product.id, cartId);
  } else if (shouldUpdateProduct) {
    await updateProductQuantityInCart(product.id, cartId, finalQuantity);
  }
};

export const updateCartItemQuantityInDb = async (
  cartId: string,
  product: Product,
  quantity: number,
): Promise<void> => {
  if (quantity > product.stock) {
    throw errors.PRODUCT_OUT_OF_STOCK(product.stock);
  }

  const cartQuantity = await getProductQuantityInCart(product.id, cartId);

  if (quantity === cartQuantity) {
    return;
  }

  if (cartQuantity === NO_QUANTITY) {
    await insertProductInCart(product.id, cartId, quantity);
  }

  if (quantity === NO_QUANTITY) {
    await deleteProductFromCart(product.id, cartId);
    return;
  }

  await updateProductQuantityInCart(product.id, cartId, quantity);
};

const getProductQuantityInCart = async (
  productId: string,
  cartId: string,
): Promise<number> => {
  const start = performance.now();
  const result = await db().query.productsToCartsTable.findFirst({
    where: and(
      eq(productsToCartsTable.productId, productId),
      eq(productsToCartsTable.cartId, cartId),
    ),
    columns: {
      quantity: true,
    },
  });
  const end = performance.now();
  logger().info("Get product query time", {
    useCase: LoggerUseCaseEnum.GET_PRODUCT_QUANTITY_IN_CART,
    data: {
      queryTime: end - start,
    },
  });
  return result?.quantity || NO_QUANTITY;
};

const insertProductInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<void> => {
  const start = performance.now();
  await db()
    .insert(productsToCartsTable)
    .values({ productId, cartId, quantity });
  const end = performance.now();
  logger().info("Insert product query time", {
    useCase: LoggerUseCaseEnum.GET_PRODUCT_QUANTITY_IN_CART,
    data: {
      queryTime: end - start,
    },
  });
};

const updateProductQuantityInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<void> => {
  const start = performance.now();
  await db()
    .update(productsToCartsTable)
    .set({ quantity })
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );
  const end = performance.now();
  logger().info("Update product query time", {
    useCase: LoggerUseCaseEnum.GET_PRODUCT_QUANTITY_IN_CART,
    data: {
      queryTime: end - start,
    },
  });
};

const deleteProductFromCart = async (
  productId: string,
  cartId: string,
): Promise<void> => {
  await db()
    .delete(productsToCartsTable)
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );
};
