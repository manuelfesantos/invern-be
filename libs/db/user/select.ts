import { usersTable } from "@schema";
import { db } from "../db-client";
import { eq } from "drizzle-orm";
import { DEFAULT_USER_VERSION, User, userSchema } from "@user-entity";
import { errors } from "@error-handling-utils";

export const getUser = async (
  where: "userId" | "email" | "cartId",
  selection: string,
): Promise<User | undefined> => {
  const userTemplate = await db().query.usersTable.findFirst({
    where: eq(usersTable[where], selection),
    with: {
      cart: {
        with: {
          productsToCarts: {
            columns: {
              quantity: true,
            },
            with: {
              product: {
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
      },
      orders: {
        columns: {
          orderId: true,
          createdAt: true,
        },
        with: {
          productsToOrders: {
            columns: { quantity: true },
            with: {
              product: {
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
          payment: true,
          address: {
            with: {
              country: {
                with: {
                  taxes: true,
                  countriesToCurrencies: {
                    columns: {},
                    with: {
                      currency: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!userTemplate) return undefined;
  const user = {
    ...userTemplate,
    cart: userTemplate?.cart
      ? {
          ...userTemplate.cart,
          products: userTemplate.cart.productsToCarts.map((product) => ({
            ...product.product,
            quantity: product.quantity,
          })),
        }
      : null,
    orders: userTemplate?.orders
      ? userTemplate.orders.map((order) => ({
          ...order,
          productsToOrders: undefined,
          products: order.productsToOrders.map((product) => ({
            ...product.product,
            quantity: product.quantity,
          })),
        }))
      : null,
  };
  return userSchema.parse(user);
};

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  return await getUser("email", email);
};

export const getUserById = async (userId: string): Promise<User> => {
  const user = await getUser("userId", userId);
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  return user;
};

export const getUserByCartId = async (cartId: string): Promise<User> => {
  const user = await getUser("cartId", cartId);
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  return user;
};

export const getUserVersionById = async (userId: string): Promise<number> => {
  const user = await db().query.usersTable.findFirst({
    where: eq(usersTable.userId, userId),
    columns: {
      version: true,
    },
  });
  return user?.version || DEFAULT_USER_VERSION;
};
