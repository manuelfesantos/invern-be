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

export type BasePreProcessorFunction<QueryFunction extends BaseQueryFunction> =
  (
    ...args: any[]
  ) => Parameters<QueryFunction> | Promise<Parameters<QueryFunction>>;

export type Action<
  Handler extends BaseQueryFunction,
  Mapper extends BaseMapperFunction<Handler> | undefined = undefined,
  PreProcessor extends
    | BasePreProcessorFunction<Handler>
    | undefined = undefined,
> = {
  query: Handler;
  run: Mapper extends BaseMapperFunction<Handler>
    ? () => Promise<ReturnType<Mapper>>
    : () => Promise<ReturnType<Handler>>;
  map?: Mapper;
  preprocess?: PreProcessor;
  params: PreProcessor extends BasePreProcessorFunction<Handler>
    ? Parameters<PreProcessor>
    : Parameters<Handler>;
};

export type Result<T extends (...args: any) => any> = Awaited<ReturnType<T>>;
