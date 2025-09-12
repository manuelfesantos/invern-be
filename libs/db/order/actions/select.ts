import type { SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { ordersTable } from "@schema";
import { db } from "@db";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@number-utils";
import type { Order } from "@order-entity";
import { baseOrderSchema } from "@order-entity";
import type { Result } from "@generics-db";
import { actionBuilder } from "@generics-db";

const selectOrdersQuery = (
  where?: "id" | "userId" | "paymentId" | "shippingTransactionId" | "stripeId",
  selection?: string,
  page?: number,
  pageSize?: number,
) => {
  let whereClause: SQL | undefined = undefined;
  if (where && selection) {
    whereClause = eq(ordersTable[where], selection);
  }
  return db().query.ordersTable.findMany({
    columns: {
      paymentId: false,
    },
    ...(whereClause && { where: whereClause }),
    with: {
      payment: {
        with: {
          paymentMethod: true,
        },
      },
      shippingTransaction: true,
    },
    limit: pageSize ?? DEFAULT_PAGE_SIZE,
    offset:
      ((page ?? DEFAULT_PAGE) - DEFAULT_PAGE) * (pageSize ?? DEFAULT_PAGE_SIZE),
  });
};

const selectOrdersByUserIdQuery = (userId: string) =>
  selectOrdersQuery("userId", userId);

const selectOrdersByIdQuery = (id: string) => selectOrdersQuery("id", id);

const selectOrdersByPaymentIdQuery = (paymentId: string) =>
  selectOrdersQuery("paymentId", paymentId);

const mapOrdersFromQueryResult = async (
  queryResults: Result<typeof selectOrdersQuery>,
): Promise<Order[]> =>
  Promise.all(
    queryResults.map((result) => ({
      ...baseOrderSchema.parse(result),
      payment: result.payment,
      shippingTransaction: result.shippingTransaction,
    })),
  );

export const getSelectOrdersAction = actionBuilder(
  selectOrdersQuery,
  mapOrdersFromQueryResult,
);

export const getSelectOrdersByUserIdAction = actionBuilder(
  selectOrdersByUserIdQuery,
  mapOrdersFromQueryResult,
);

export const getSelectOrdersByIdAction = actionBuilder(
  selectOrdersByIdQuery,
  mapOrdersFromQueryResult,
);

export const getSelectOrderProductsByPaymentIdAction = actionBuilder(
  selectOrdersByPaymentIdQuery,
  mapOrdersFromQueryResult,
);
