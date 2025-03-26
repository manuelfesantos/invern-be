import { db } from "@db";
import { cartsTable } from "@schema";
import { eq } from "drizzle-orm";
import { Cart } from "@cart-entity";
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";

type CartQueryResult = {
  id: string;
  lastModifiedAt: string;
  createdAt: string;
  isLoggedIn: boolean;
  productsToCarts: {
    quantity: number;
    product: {
      id: string;
      createdAt: string;
      lastModifiedAt: string;
      name: string;
      stock: number;
      priceInCents: number;
      weight: number;
      images: {
        createdAt: string;
        lastModifiedAt: string;
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
  const cartTemplate = await selectCartRawQuery(cartId);

  if (cartTemplate) {
    return cartFromRawQueryResult(cartTemplate);
  }
};
