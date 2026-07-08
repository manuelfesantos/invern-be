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
  page?: number,
  pageSize?: number,
  where?: SQL,
  orderBy?: SQL[],
) =>
  db().query.ordersTable.findMany({
    columns: {
      paymentId: false,
    },
    ...(where && { where }),
    ...(orderBy && { orderBy }),
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

const selectOrdersByUserIdQuery = (userId: string) =>
  selectOrdersQuery(undefined, undefined, eq(ordersTable.userId, userId));

const selectOrdersByIdQuery = (id: string) =>
  selectOrdersQuery(undefined, undefined, eq(ordersTable.id, id));

const selectOrdersByStripeIdQuery = (stripeId: string) =>
  selectOrdersQuery(undefined, undefined, eq(ordersTable.stripeId, stripeId));

const selectOrdersByPaymentIdQuery = (paymentId: string) =>
  selectOrdersQuery(undefined, undefined, eq(ordersTable.paymentId, paymentId));

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

export const getSelectOrdersByStripeIdAction = actionBuilder(
  selectOrdersByStripeIdQuery,
  mapOrdersFromQueryResult,
);

export const getSelectOrderProductsByPaymentIdAction = actionBuilder(
  selectOrdersByPaymentIdQuery,
  mapOrdersFromQueryResult,
);
