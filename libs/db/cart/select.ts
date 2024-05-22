import { db } from "../db-client";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { Cart, cartSchema } from "@cart-entity";

export const getCartById = async (cartId: string): Promise<Cart> => {
  const cartTemplate = await db().query.cartsTable.findFirst({
    where: eq(cartsTable.cartId, cartId),
    columns: {
      userId: false,
    },
    with: {
      productsToCarts: {
        with: {
          product: {
            columns: {
              collectionId: false,
            },
            with: {
              images: {
                columns: {
                  productId: false,
                  collectionId: false,
                },
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  return cartSchema.parse({
    ...cartTemplate,
    products: cartTemplate?.productsToCarts.map((product) => ({
      ...product.product,
      quantity: product.quantity,
    })),
  });
};
