// api-client freshness gate (Feature 14 step 03).
//
// Fails (exit 1) when the committed generated client (`src/schema.d.ts`) is
// stale relative to the current `swagger.yaml`. Pairs with the repo's
// `openapi:check` (spec-matches-code) to close the contract loop end to end:
//   routes → swagger.yaml (openapi:check) → generated client (this check).
//
// It regenerates the schema to a temp file with the SAME command `generate:api`
// uses, then byte-compares — so a fresh client is identical, and any spec change
// that wasn't regenerated + committed fails here.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(HERE, "..");
const SPEC = path.resolve(PKG, "../../swagger.yaml");
const COMMITTED = path.resolve(PKG, "src/schema.d.ts");
const TMP = path.join(os.tmpdir(), "invern-api-client-schema.check.d.ts");

execFileSync(
  "npx",
  ["openapi-typescript", SPEC, "--output", TMP],
  { cwd: PKG, stdio: ["ignore", "ignore", "inherit"] },
);

const fresh = fs.readFileSync(TMP, "utf8");
const committed = fs.existsSync(COMMITTED) ? fs.readFileSync(COMMITTED, "utf8") : "";
fs.rmSync(TMP, { force: true });

if (fresh !== committed) {
  console.error(
    "\n✖ packages/api-client/src/schema.d.ts is stale vs swagger.yaml.\n" +
      "  Run `npm run generate:api -w @invern/api-client` and commit the result.\n",
  );
  process.exit(1);
}

console.log("✓ api-client schema is up to date with swagger.yaml");
