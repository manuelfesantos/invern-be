import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { count, desc, lte } from "drizzle-orm";
import { db } from "@db";
import { actionBuilder } from "@generics-db";
import { ordersTable, productsTable } from "@schema";

// Generic COUNT(*) over any table — used for the dashboard's cheap entity counts.
const countRowsQuery = (table: SQLiteTable) =>
  db().select({ count: count() }).from(table);

export const getCountAction = actionBuilder(
  countRowsQuery,
  (result: { count: number }[]): number => result[0]?.count ?? 0,
);

// Products at/under the low-stock threshold — bounded select, lowest first.
const selectLowStockProductsQuery = (threshold: number, limit: number) =>
  db()
    .select({
      id: productsTable.id,
      name: productsTable.name,
      stock: productsTable.stock,
    })
    .from(productsTable)
    .where(lte(productsTable.stock, threshold))
    .orderBy(productsTable.stock)
    .limit(limit);

export const getSelectLowStockProductsAction = actionBuilder(
  selectLowStockProductsQuery,
);

// Most recent orders — bounded select, newest first (no heavy per-row math).
const selectRecentOrdersQuery = (limit: number) =>
  db()
    .select({
      id: ordersTable.id,
      createdAt: ordersTable.createdAt,
      isCanceled: ordersTable.isCanceled,
    })
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit);

export const getSelectRecentOrdersAction = actionBuilder(
  selectRecentOrdersQuery,
);
