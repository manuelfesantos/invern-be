import { count, TableConfig } from "drizzle-orm";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { db } from "@db";
import { NonEmptyArray } from "@global-entity";
import {
  Action,
  BaseMapperFunction,
  BaseQueryFunction,
  actionBuilder,
} from "../actions";

const NO_COUNT = 0;
const FIRST_INDEX = 0;

type BaseAction = Action<
  BaseQueryFunction,
  BaseMapperFunction<BaseQueryFunction> | undefined
>;

type ActionsType = NonEmptyArray<BaseAction>;

type BatchOperationResult<T extends ActionsType> = {
  [K in keyof T]: T[K] extends { map?: infer M }
    ? M extends BaseMapperFunction<BaseQueryFunction>
      ? Awaited<ReturnType<M>>
      : Awaited<ReturnType<T[K]["query"]>>
    : never;
};

export const runBatchOperation = async <const Actions extends ActionsType>(
  ...actions: Actions
): Promise<BatchOperationResult<Actions>> => {
  const queries = actions.map((action) => action.query()) as {
    [K in keyof Actions]: ReturnType<Actions[K]["query"]>;
  };
  if (!queries.length) {
    throw Error("No queries provided in batch operation");
  }
  const results = await db().batch(queries);

  const mappedResults = [];

  for (let i = 0; i < actions.length; i++) {
    mappedResults[i] = (await actions[i].map?.(results[i])) ?? results[i];
  }

  return mappedResults as BatchOperationResult<Actions>;
};

export const createOperationBatch = <Actions extends ActionsType>(
  ...args: Actions
) => {
  const operationBatch: Actions = [...args];
  const addAction = <Action extends BaseAction>(action: Action) => {
    operationBatch.push(action);
  };
  const run = async () => {
    const results = await runBatchOperation(...operationBatch);
    operationBatch.length = 0;
    return results;
  };
  return {
    addAction,
    run,
  };
};

const countQuery = <T extends TableConfig>(table: SQLiteTableWithColumns<T>) =>
  db().select({ count: count() }).from(table);

export const runBatchOperationWithCount = async <
  T extends TableConfig,
  Actions extends ActionsType,
>(
  table: SQLiteTableWithColumns<T>,
  ...actions: Actions
): Promise<[count: number, ...results: BatchOperationResult<Actions>]> => {
  const countQueryAction = actionBuilder(countQuery);
  const [countRawResult, ...results] = await runBatchOperation(
    countQueryAction(table),
    ...actions,
  );
  const countResult = countRawResult[FIRST_INDEX] ?? NO_COUNT;
  return [countResult.count, ...results];
};
