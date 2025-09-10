import { db } from "@db";
import { DEFAULT_PAGE } from "@number-utils";
import { and, desc, eq } from "drizzle-orm";
import { cartsTable, imagesTable, productsToCartsTable } from "@schema";
import type { Cart} from "@cart-entity";
import { cartSchema } from "@cart-entity";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";

const selectAllCartsQuery = (page: number, pageSize: number) =>
  db().query.cartsTable.findMany({
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
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

const mapCartsFromSelectAll = (
  queryResult: Result<typeof selectAllCartsQuery>,
): Cart[] => {
  return queryResult.map((result) =>
    cartSchema.parse({
      ...result,
      products: result?.productsToCarts.map((product) => ({
        ...product.product,
        quantity: product.quantity,
      })),
    }),
  );
};

const selectCartByIdQuery = (cartId: string) =>
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
                orderBy: [desc(imagesTable.isThumbnail)],
              },
            },
          },
        },
      },
    },
  });

const mapCartFromSelectById = (
  queryResult: Result<typeof selectCartByIdQuery>,
): Cart | undefined => {
  if (!queryResult) return;
  return cartSchema.parse({
    ...queryResult,
    products: queryResult?.productsToCarts.map((product) => ({
      ...product.product,
      quantity: product.quantity,
    })),
  });
};

const selectProductQuantityInCartQuery = (productId: string, cartId: string) =>
  db().query.productsToCartsTable.findFirst({
    where: and(
      eq(productsToCartsTable.productId, productId),
      eq(productsToCartsTable.cartId, cartId),
    ),
    columns: {
      quantity: true,
    },
  });

const mapProductQuantityInCartFromSelectById = (
  queryResult: Result<typeof selectProductQuantityInCartQuery>,
): number | undefined => {
  if (!queryResult) return;
  return queryResult.quantity;
};

export const getSelectAllCartsAction = actionBuilder(
  selectAllCartsQuery,
  mapCartsFromSelectAll,
);

export const getSelectCartByIdAction = actionBuilder(
  selectCartByIdQuery,
  mapCartFromSelectById,
);

export const getSelectProductQuantityInCartAction = actionBuilder(
  selectProductQuantityInCartQuery,
  mapProductQuantityInCartFromSelectById,
);
