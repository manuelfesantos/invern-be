import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@schema";
import { ENV } from "@env-utils";
let dbClient: DrizzleD1Database<typeof schema> | null = null;

export const db = (): DrizzleD1Database<typeof schema> => {
  if (!dbClient) {
    dbClient = drizzle(ENV.INVERN_DB, { schema });
  }
  return dbClient;
};
