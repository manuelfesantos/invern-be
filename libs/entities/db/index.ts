import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm/relations";

export type DbTransaction = SQLiteTransaction<
  "async",
  D1Result<unknown>,
  typeof import("@db-schema"),
  ExtractTablesWithRelations<typeof import("@db-schema")>
>;
