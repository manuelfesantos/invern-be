import { db } from "@db";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { Cart, cartSchema } from "@cart-entity";

export const getCartById = async (
  cartId: string,
): Promise<Cart | undefined> => {
  const cartTemplate = await db().query.cartsTable.findFirst({
    where: eq(cartsTable.id, cartId),
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

  if (cartTemplate) {
    return cartSchema.parse({
      ...cartTemplate,
      products: cartTemplate?.productsToCarts.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
    });
  }
};
