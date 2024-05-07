import { errors } from "@error-handling-utils";

let db: D1Database | null = null;

export const initDb = (database: D1Database): void => {
  if (!db) {
    db = database;
  }
};

export const prepareStatement = (query: string): D1PreparedStatement => {
  if (!db) {
    throw errors.DATABASE_NOT_INITIALIZED();
  }
  return db.prepare(query);
};

export const batchStatements = <T>(
  queries: D1PreparedStatement[],
): Promise<D1Result<T>[]> => {
  if (!db) {
    throw errors.DATABASE_NOT_INITIALIZED();
  }
  return db.batch<T>(queries);
};
