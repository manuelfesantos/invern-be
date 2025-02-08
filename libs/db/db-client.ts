import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@schema";
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
