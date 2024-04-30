import { D1Database } from "@cloudflare/workers-types";

let database: D1Database | null = null;

export const initDb = (db: D1Database) => {
  if (!database) {
    database = db;
  }
};

export const db = () => {
  if (!database) {
    throw new Error("Database not initialized!");
  }
  return database;
};
