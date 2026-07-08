import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, like, lte } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/**
 * Shared, allow-list-driven `orderBy`/`where` builders for admin list queries.
 * Callers map allow-listed field names → columns (sort) and filter keys →
 * condition builders (filter); values reach SQL only through Drizzle's
 * parameter binding — field/filter names never come from raw request strings.
 */

/** Sort field name → the column it orders by. */
export type SortMap = Record<string, SQLiteColumn>;

/** Turns a raw (already string) filter value into a bound SQL condition. */
export type FilterBuilder = (value: string) => SQL | undefined;

/** Filter key → its condition builder. */
export type FilterMap = Record<string, FilterBuilder>;

/** Exact match (`column = value`). */
export const eqFilter =
  (column: SQLiteColumn): FilterBuilder =>
  (value) =>
    eq(column, value);

/** Case-insensitive contains (`column LIKE %value%`), value bound as a param. */
export const likeFilter =
  (column: SQLiteColumn): FilterBuilder =>
  (value) =>
    like(column, `%${value}%`);

/** Boolean match; ignores anything that isn't the literal "true"/"false". */
export const boolFilter =
  (column: SQLiteColumn): FilterBuilder =>
  (value) =>
    value === "true"
      ? eq(column, true)
      : value === "false"
        ? eq(column, false)
        : undefined;

/** Upper bound (`column <= value`) — e.g. low-stock thresholds. */
export const maxNumberFilter =
  (column: SQLiteColumn): FilterBuilder =>
  (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? lte(column, parsed) : undefined;
  };

/**
 * Resolves a validated `sortBy`/`sortOrder` to a Drizzle `orderBy`. Returns
 * `undefined` (no ordering) when no sort field is set or it isn't in the map.
 */
export const buildOrderBy = (
  sortMap: SortMap,
  sortBy: string | undefined,
  sortOrder: "asc" | "desc",
): SQL[] | undefined => {
  const column = sortBy ? sortMap[sortBy] : undefined;
  if (!column) {
    return undefined;
  }
  return [sortOrder === "desc" ? desc(column) : asc(column)];
};

/**
 * ANDs together every filter whose key is present (and non-empty) in the query.
 * Keys absent from `filterMap` are ignored. Returns `undefined` when nothing
 * applies, so the caller runs an unfiltered query.
 */
export const buildWhere = (
  filterMap: FilterMap,
  query: Record<string, string | undefined>,
): SQL | undefined => {
  const conditions = Object.entries(filterMap)
    .map(([key, build]) => {
      const value = query[key];
      return value === undefined || value === "" ? undefined : build(value);
    })
    .filter((condition): condition is SQL => Boolean(condition));
  return conditions.length ? and(...conditions) : undefined;
};
