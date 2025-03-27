import { createClient } from "@libsql/client";
import { ENV } from "@env-utils";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@db-schema";
import { AsyncLocalStorage } from "node:async_hooks";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbTransaction = SQLiteTransaction<
  "async",
  any,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
/* eslint-enable @typescript-eslint/no-explicit-any */

let dbClient: LibSQLDatabase<typeof schema> | null = null;

const getDbClient = (): LibSQLDatabase<typeof schema> =>
  drizzle(
    createClient({
      url: ENV.TURSO_CONNECTION_URL,
      authToken: ENV.TURSO_AUTH_TOKEN,
    }),
    { schema },
  );

const txStorage = new AsyncLocalStorage<DbTransaction>();

export const withTransaction =
  <T, A extends unknown[]>(callback: (...args: A) => Promise<T>) =>
  async (...args: A): Promise<T> => {
    if (!dbClient) {
      dbClient = getDbClient();
    }
    return await dbClient.transaction(async (tx) => {
      return await txStorage.run(tx, async () => {
        return await callback(...args);
      });
    });
  };

export const rollbackTransaction = (): void => txStorage.getStore()?.rollback();

export function db(useTransaction: true): DbTransaction;
export function db(useTransaction: false): LibSQLDatabase<typeof schema>;
export function db(
  useTransaction?: boolean,
): DbTransaction | LibSQLDatabase<typeof schema>;
export function db(
  canUseTransaction = true,
): DbTransaction | LibSQLDatabase<typeof schema> {
  if (!dbClient) {
    dbClient = getDbClient();
  }
  if (canUseTransaction) {
    const tx = txStorage.getStore();
    return tx || dbClient;
  }
  return dbClient;
}
