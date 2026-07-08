import type { SQL, TableConfig } from "drizzle-orm";
import { count } from "drizzle-orm";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { db } from "@db";
import type {
  Action,
  BaseMapperFunction,
  BaseQueryFunction,
  BasePreProcessorFunction,
} from "../actions";
import { actionBuilder } from "../actions";
import type { BatchItem } from "drizzle-orm/batch";

const NO_COUNT = 0;
const FIRST_INDEX = 0;

type BaseAction = Action<
  BaseQueryFunction,
  BaseMapperFunction<BaseQueryFunction> | undefined,
  BasePreProcessorFunction<BaseQueryFunction> | undefined
>;

type NonEmptyArray<T> = [T, ...T[]];

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

const countQuery = <T extends TableConfig>(
  table: SQLiteTableWithColumns<T>,
  where?: SQL,
) => {
  const query = db().select({ count: count() }).from(table);
  return where ? query.where(where) : query;
};

/**
 * Runs a data action alongside a `COUNT(*)` in one batch. When `where` is
 * supplied it is applied to the count too, so the paginated envelope's `total`
 * reflects the same filter as the data query (the data action must apply the
 * matching `where` itself).
 */
export const runBatchOperationWithCount = async <
  T extends TableConfig,
  Action extends BaseAction,
>(
  table: SQLiteTableWithColumns<T>,
  action: Action,
  where?: SQL,
): Promise<[count: number, result: ActionFinalReturnType<Action>]> => {
  const countQueryAction = actionBuilder(countQuery);
  const [countRawResult, result] = await runBatchOperation(
    countQueryAction(table, where),
    action,
  );
  const countResult = countRawResult[FIRST_INDEX] ?? NO_COUNT;
  return [countResult.count, result as ActionFinalReturnType<Action>];
};
