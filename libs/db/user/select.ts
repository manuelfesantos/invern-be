import { usersTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { User, userSchema } from "@user-entity";
import { errors } from "@error-handling-utils";

const NO_USER_VERSION = 0;

const getUser = async (
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

export const getUserVersionById = async (userId: string): Promise<number> => {
  const user = await db().query.usersTable.findFirst({
    where: eq(usersTable.userId, userId),
    columns: {
      version: true,
    },
  });
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  return user.version ?? NO_USER_VERSION;
};
