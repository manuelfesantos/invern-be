import { db } from "@db";
import { productsToCartsTable } from "@schema";

export const insertProductInCart = (
  productId: string,
  cartId: string,
  quantity: number,
) => db().insert(productsToCartsTable).values({ productId, cartId, quantity });
