import { createClient } from "@libsql/client";
import { ENV } from "@env-utils";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@db-schema";

let dbClient: LibSQLDatabase<typeof schema> | null = null;

const getDbClient = (): LibSQLDatabase<typeof schema> =>
  drizzle(
    createClient({
      url: ENV.TURSO_CONNECTION_URL,
      authToken: ENV.TURSO_AUTH_TOKEN,
    }),
    { schema },
  );

export const db = (): LibSQLDatabase<typeof schema> => {
  if (!dbClient) {
    dbClient = getDbClient();
  }

  return dbClient;
};
