// import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// config({ path: ".dev.vars" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // dbCredentials: {
  //   url: process.env.TURSO_CONNECTION_URL!,
  //   authToken: process.env.TURSO_AUTH_TOKEN!,
  // },
});
