import { count, TableConfig } from "drizzle-orm";
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { db } from "@db";
import { NonEmptyArray } from "@global-entity";
import {
  Action,
  BaseMapperFunction,
  BaseQueryFunction,
  actionBuilder,
  BasePreProcessorFunction,
} from "../actions";
import { BatchItem } from "drizzle-orm/batch";

const NO_COUNT = 0;
const FIRST_INDEX = 0;

type BaseAction = Action<
  BaseQueryFunction,
  BaseMapperFunction<BaseQueryFunction> | undefined,
  BasePreProcessorFunction<BaseQueryFunction> | undefined
>;

type ActionsType = NonEmptyArray<BaseAction | undefined>;

type ActionFinalReturnType<Action extends BaseAction | undefined> =
  Action extends { map?: infer M }
    ? M extends BaseMapperFunction<BaseQueryFunction>
      ? Awaited<ReturnType<M>>
      : Awaited<ReturnType<Action["query"]>>
    : undefined;

type BatchOperationResult<Actions extends ActionsType> = {
  [K in keyof Actions]: ActionFinalReturnType<Actions[K]>;
};

export const runBatchOperation = async <Actions extends ActionsType>(
  ...actions: Actions
): Promise<BatchOperationResult<Actions>> => {
  const params = await Promise.all(
    actions.map(
      async (action) =>
        (await action?.preProcess?.(...action.params)) ?? action?.params,
    ),
  );

  const queries = actions
    .map((action, index) => action?.query(...(params[index] ?? [])))
    .filter((action) => action !== undefined) as NonEmptyArray<
    BatchItem<"sqlite">
  >;

  if (!queries.length) {
    throw Error("No queries provided in batch operation");
  }

  const results = await db().batch(queries);

  const mappedResults = [];
  let resultsIndex = 0;

  for (let i = 0; i < actions.length; i++) {
    if (actions[i] !== undefined) {
      mappedResults[i] =
        (await actions[i]?.map?.(results[resultsIndex])) ??
        results[resultsIndex];
      resultsIndex++;
    } else {
      mappedResults[i] = undefined;
    }
  }

  return mappedResults as BatchOperationResult<Actions>;
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
