import type { User, UserValidationStatus } from "@user-entity";
import { UserValidationStatusEnum } from "@user-entity";
import { logger } from "@logger-utils";
import { LoggerUseCaseEnum } from "@logger-entity";
import { decryptObjectString } from "@crypto-utils";
import type { Address } from "@address-entity";
import { db } from "@db";
import { DEFAULT_PAGE } from "@number-utils";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";
import { and, eq } from "drizzle-orm";
import { usersTable } from "@schema";

const NO_USER_VERSION = 0;

const selectUserQuery = (
  where: "id" | "email" | "cartId" | "googleUserId",
  selection: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.ALL,
) => {
  const filterUserBySelectionQuery = () => eq(usersTable[where], selection);

  return db().query.usersTable.findFirst({
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
};

const selectUserByEmailQuery = (
  email: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.ALL,
) => selectUserQuery("email", email, validationStatus);

const selectUserByIdQuery = (
  userId: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.ALL,
) => selectUserQuery("id", userId, validationStatus);

const selectUserByGoogleUserIdQuery = async (
  googleUserId: string,
  validationStatus: UserValidationStatus = UserValidationStatusEnum.ALL,
) => selectUserQuery("googleUserId", googleUserId, validationStatus);

const mapUserFromSelectResult = async (
  userQueryResult: Result<typeof selectUserQuery> | undefined,
): Promise<User | undefined> => {
  if (!userQueryResult) return;

  return {
    ...userQueryResult,
    cart: userQueryResult?.cart
      ? {
          ...userQueryResult.cart,
          products: userQueryResult.cart.productsToCarts.map((product) => ({
            ...product.product,
            quantity: product.quantity,
          })),
        }
      : null,
    address: userQueryResult.address
      ? await decryptObjectString<Address>(userQueryResult.address)
      : null,
  };
};

const selectUserVersionByIdQuery = (userId: string) =>
  db().query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      version: true,
    },
  });

const mapUserVersionFromSelectVersionResult = (
  queryResult: Result<typeof selectUserVersionByIdQuery>,
): number => {
  logger().info("user version", {
    useCase: LoggerUseCaseEnum.GET_USER,
    data: {
      version: queryResult?.version,
    },
  });
  return queryResult?.version ?? NO_USER_VERSION;
};

const selectAllUsersQuery = (page: number, pageSize: number) =>
  db().query.usersTable.findMany({
    limit: pageSize,
    offset: (page - DEFAULT_PAGE) * pageSize,
  });

const selectUserDetailsByIdQuery = async (userId: string) =>
  db().query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: {
      email: true,
      firstName: true,
      lastName: true,
    },
  });

export const getSelectAllUsersAction = actionBuilder(selectAllUsersQuery);

export const getSelectUserByEmailAction = actionBuilder(
  selectUserByEmailQuery,
  mapUserFromSelectResult,
);

export const getSelectUserByIdAction = actionBuilder(
  selectUserByIdQuery,
  mapUserFromSelectResult,
);

export const getSelectUserByGoogleUserIdAction = actionBuilder(
  selectUserByGoogleUserIdQuery,
  mapUserFromSelectResult,
);

export const getSelectUserVersionByIdAction = actionBuilder(
  selectUserVersionByIdQuery,
  mapUserVersionFromSelectVersionResult,
);

export const getSelectUserDetailsByIdAction = actionBuilder(
  selectUserDetailsByIdQuery,
);
