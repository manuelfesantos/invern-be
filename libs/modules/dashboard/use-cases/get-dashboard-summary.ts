import { runBatchOperation } from "@generics-db";
import {
  getCountAction,
  getSelectLowStockProductsAction,
  getSelectRecentOrdersAction,
} from "@dashboard-db";
import {
  collectionsTable,
  ordersTable,
  productsTable,
  usersTable,
} from "@schema";
import { LOW_STOCK_THRESHOLD } from "@number-utils";

const LOW_STOCK_LIMIT = 10;
const RECENT_ORDERS_LIMIT = 5;

export interface DashboardSummary {
  counts: {
    orders: number;
    products: number;
    users: number;
    collections: number;
  };
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; createdAt: string; isCanceled: boolean }[];
}

/**
 * A cheap operational overview for the backoffice home: entity counts, low-stock
 * products, and the most recent orders. All six aggregates run in ONE D1 batch
 * (four COUNT(*)s + two bounded selects) — no table is ever fetched whole.
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const [orders, products, users, collections, lowStock, recentOrders] =
    await runBatchOperation(
      getCountAction(ordersTable),
      getCountAction(productsTable),
      getCountAction(usersTable),
      getCountAction(collectionsTable),
      getSelectLowStockProductsAction(LOW_STOCK_THRESHOLD, LOW_STOCK_LIMIT),
      getSelectRecentOrdersAction(RECENT_ORDERS_LIMIT),
    );

  return {
    counts: { orders, products, users, collections },
    lowStock,
    recentOrders: recentOrders.map((order) => ({
      ...order,
      isCanceled: Boolean(order.isCanceled),
    })),
  };
};
