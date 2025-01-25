import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@schema";
import { contextStore } from "@context-utils";
let dbClient: DrizzleD1Database<typeof schema> | null = null;

export const initDb = (database: D1Database): void => {
  if (!dbClient) {
    dbClient = drizzle(database, { schema });
  }
};

export const db = (): DrizzleD1Database<typeof schema> => {
  if (!dbClient) {
    throw new Error("Database not initialized");
  }
  return dbClient;
};

export const transaction = async <T>(fn: () => Promise<T>): Promise<T> => {
  return db().transaction(async (tx) => {
    try {
      contextStore.context.transaction = tx;
      return fn();
    } catch (error) {
      tx.rollback();
      throw error;
    } finally {
      contextStore.context.transaction = undefined;
    }
  });
};
