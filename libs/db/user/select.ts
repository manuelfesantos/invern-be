import { usersTable } from "@schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import { User } from "@user-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { decryptObjectString } from "@crypto-utils";
import { Address } from "@address-entity";

const NO_USER_VERSION = 0;

const getUser = async (
  where: "id" | "email" | "cartId",
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
  return {
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
    address: userTemplate.address
      ? await decryptObjectString<Address>(userTemplate.address)
      : null,
  };
};

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  return await getUser("email", email);
};

export const getUserById = async (userId: string): Promise<User> => {
  const user = await getUser("id", userId);
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  return user;
};

export const getUserVersionById = async (userId: string): Promise<number> => {
  const user = await db().query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      version: true,
    },
  });
  logger().info("user version", {
    useCase: LoggerUseCaseEnum.GET_USER,
    data: {
      userId,
      version: user?.version,
    },
  });
  return user?.version ?? NO_USER_VERSION;
};
