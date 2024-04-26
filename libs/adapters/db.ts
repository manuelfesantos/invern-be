import { D1Database } from "@cloudflare/workers-types";

let db: D1Database | null = null;

export const initDb = (database: D1Database) => {
  if (!db) {
    db = database;
    console.log("Database initialized!", db);
  }
};

export const getDb = () => {
  if (!db) {
    console.log("Database not initialized!");
    throw new Error("Database not initialized!");
  }
  return db;
};
