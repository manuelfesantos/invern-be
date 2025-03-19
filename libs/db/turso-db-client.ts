import { createClient } from "@libsql/client";
import { ENV } from "@env-utils";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import { schema } from "@db-schema";

let dbClient: LibSQLDatabase<typeof schema> | null = null;

export const db = (): LibSQLDatabase<typeof schema> => {
  if (!dbClient) {
    dbClient = drizzle(
      createClient({
        url: ENV.TURSO_CONNECTION_URL,
        authToken: ENV.TURSO_AUTH_TOKEN,
      }),
      { schema },
    );
  }
  return dbClient;
};
