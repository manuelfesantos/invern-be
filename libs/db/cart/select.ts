import { db } from "@db";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { Cart } from "@cart-entity";
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";

type CartQueryResult = {
  id: string;
  lastModifiedAt: number;
  isLoggedIn: boolean;
  productsToCarts: {
    quantity: number;
    product: {
      id: string;
      name: string;
      stock: number;
      priceInCents: number;
      weight: number;
      images: {
        alt: string;
        url: string;
      }[];
    };
  }[];
};

export const selectCartRawQuery = (
  cartId: string,
): SQLiteRelationalQuery<"async", CartQueryResult | undefined> =>
  db().query.cartsTable.findFirst({
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

export const cartFromRawQueryResult = (queryResult: CartQueryResult): Cart => {
  return {
    ...queryResult,
    products: queryResult?.productsToCarts.map((product) => ({
      ...product.product,
      quantity: product.quantity,
    })),
  };
};

export const selectCartById = async (
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
    return {
      ...cartTemplate,
      products: cartTemplate?.productsToCarts.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
    };
  }
};
