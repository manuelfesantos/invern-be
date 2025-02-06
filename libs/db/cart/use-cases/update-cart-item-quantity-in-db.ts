import { db } from "@db";
import { productsToCartsTable } from "@schema";
import { and, eq } from "drizzle-orm";
import { errors } from "@error-handling-utils";
import { Product } from "@product-entity";

const NO_QUANTITY = 0;

export const updateCartItemQuantityInDb = async (
  cartId: string,
  product: Product,
  quantity: number,
): Promise<void> => {
  const cartQuantity = await getProductQuantityInCart(product.id, cartId);

  const finalQuantity = cartQuantity + quantity;

  const shouldInsertProduct = !cartQuantity && finalQuantity > NO_QUANTITY;
  const shouldUpdateProduct = cartQuantity && finalQuantity > NO_QUANTITY;
  const shouldDeleteProduct = cartQuantity && finalQuantity <= NO_QUANTITY;
  const invalidCase = !cartQuantity && finalQuantity <= NO_QUANTITY;
  const notEnoughStock = product.stock < finalQuantity;

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
  await db()
    .insert(productsToCartsTable)
    .values({ productId, cartId, quantity });
};

const updateProductQuantityInCart = async (
  productId: string,
  cartId: string,
  quantity: number,
): Promise<void> => {
  await db()
    .update(productsToCartsTable)
    .set({ quantity })
    .where(
      and(
        eq(productsToCartsTable.productId, productId),
        eq(productsToCartsTable.cartId, cartId),
      ),
    );
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
