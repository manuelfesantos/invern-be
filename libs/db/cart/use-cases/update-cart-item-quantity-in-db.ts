import { db } from "@db";
import { cartsTable, productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { errors } from "@error-handling-utils";
import { Product } from "@product-entity";

const NO_QUANTITY = 0;
const FIRST_INDEX = 0;

export const patchCartItemQuantityInDb = async (
  cartId: string,
  product: Product,
  quantity: number,
): Promise<number> => {
  if (quantity === NO_QUANTITY) throw errors.INVALID_PRODUCT_QUANTITY();

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
    return quantity;
  } else if (shouldDeleteProduct) {
    await deleteProductFromCart(product.id, cartId);
    return NO_QUANTITY;
  } else if (shouldUpdateProduct) {
    await updateProductQuantityInCart(product.id, cartId, finalQuantity);
    return finalQuantity;
  }
  throw errors.PRODUCT_NOT_IN_CART();
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
  const result = await db().query.productsToCartsTable.findFirst({
    where: and(
      eq(productsToCartsTable.productId, productId),
      eq(productsToCartsTable.cartId, cartId),
    ),
    columns: {
      quantity: true,
    },
  });

  return result?.quantity || NO_QUANTITY;
};

const insertProductInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<void> => {
  await db().batch([
    db().insert(productsToCartsTable).values({ productId, cartId, quantity }),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
  ]);
};

const updateProductQuantityInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<number> => {
  const newQuantity = await db().batch([
    db()
      .update(productsToCartsTable)
      .set({ quantity })
      .where(
        and(
          eq(productsToCartsTable.productId, productId),
          eq(productsToCartsTable.cartId, cartId),
        ),
      )
      .returning({ quantity: productsToCartsTable.quantity }),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
  ]);

  return newQuantity[FIRST_INDEX][FIRST_INDEX].quantity;
};

const deleteProductFromCart = async (
  productId: string,
  cartId: string,
): Promise<void> => {
  await db().batch([
    db()
      .delete(productsToCartsTable)
      .where(
        and(
          eq(productsToCartsTable.productId, productId),
          eq(productsToCartsTable.cartId, cartId),
        ),
      ),
    db()
      .update(cartsTable)
      .set({ lastModifiedAt: Date.now() })
      .where(eq(cartsTable.id, cartId)),
  ]);
};
