/* eslint-disable @typescript-eslint/no-explicit-any */

import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query";
import { SQLiteSelectBase } from "drizzle-orm/sqlite-core/query-builders/select";
import { GetSelectTableName } from "drizzle-orm/query-builders/select.types";
import {
  SQLiteDeleteWithout,
  SQLiteInsertWithout,
  SQLiteSelect,
  SQLiteTableWithColumns,
  SQLiteUpdateWithout,
} from "drizzle-orm/sqlite-core";
import { SQL } from "drizzle-orm";

export type BaseQueryFunction = (
  ...args: any[]
) =>
  | SQLiteRelationalQuery<any, any>
  | SQLiteUpdateWithout<any, any, any>
  | SQLiteDeleteWithout<any, any, any>
  | SQLiteInsertWithout<any, any, any>
  | SQLiteSelect
  | SQLiteSelectBase<
      GetSelectTableName<SQLiteTableWithColumns<any>>,
      "async",
      any,
      { count: SQL<number> },
      "partial",
      any,
      any,
      any,
      any,
      any
    >;

export type BaseMapperFunction<QueryFunction extends BaseQueryFunction> = (
  result: Awaited<ReturnType<QueryFunction>>,
) => unknown;

export type QueryAction<Handler extends BaseQueryFunction> = (
  ...params: Parameters<Handler>
) => {
  query: () => ReturnType<Handler>;
  run: () => ReturnType<Handler>;
};

export type MappedAction<
  Handler extends BaseQueryFunction,
  Mapper extends BaseMapperFunction<Handler>,
> = (...params: Parameters<Handler>) => {
  run: () => Promise<ReturnType<Mapper>>;
  query: () => ReturnType<Handler>;
  map: Mapper;
};

export const actionBuilder = <
  Handler extends BaseQueryFunction,
  Mapper extends BaseMapperFunction<Handler> | undefined = undefined,
>(
  handler: Handler,
  mapper?: Mapper,
): ((...params: Parameters<Handler>) => Action<Handler, Mapper>) => {
  return (...params: Parameters<Handler>) => {
    return {
      query: (() => handler(...params)) as Handler,
      run: (mapper
        ? async () => mapper(await handler(...params))
        : () => handler(...params)) as Action<Handler, Mapper>["run"],
      map: mapper,
    };
  };
};

export type Action<
  Handler extends BaseQueryFunction,
  Mapper extends BaseMapperFunction<Handler> | undefined = undefined,
> = {
  query: Handler;
  run: Mapper extends BaseMapperFunction<Handler>
    ? () => Promise<ReturnType<Mapper>>
    : () => ReturnType<Handler>;
  map?: Mapper;
};

export type Result<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
