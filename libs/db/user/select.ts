import { usersTable } from "@schema";
import { db } from "@db";
import { and, eq } from "drizzle-orm";
import {
  User,
  UserValidationStatus,
  UserValidationStatusEnum,
} from "@user-entity";
import { errors } from "@error-handling-utils";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { decryptObjectString } from "@crypto-utils";
import { Address } from "@address-entity";

const NO_USER_VERSION = 0;

const selectUser = async (
  where: "id" | "email" | "cartId" | "googleUserId",
  selection: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.VALIDATED,
): Promise<User | undefined> => {
  const filterUserBySelectionQuery = () => eq(usersTable[where], selection);

  const userTemplate = await db().query.usersTable.findFirst({
    where:
      validationStatus !== null
        ? and(
            filterUserBySelectionQuery(),
            eq(usersTable.isValidated, validationStatus),
          )
        : filterUserBySelectionQuery(),
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

export const selectUserByEmail = async (
  email: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.VALIDATED,
): Promise<User | undefined> => {
  return await selectUser("email", email, validationStatus);
};

export const selectUserById = async (
  userId: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.VALIDATED,
): Promise<User> => {
  const user = await selectUser("id", userId, validationStatus);
  if (!user) {
    throw errors.USER_NOT_FOUND();
  }
  return user;
};

export const selectUserByGoogleUserId = async (
  googleUserId: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.VALIDATED,
): Promise<User | undefined> => {
  return await selectUser("googleUserId", googleUserId, validationStatus);
};

export const selectUserVersionById = async (
  userId: string,
): Promise<number> => {
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
