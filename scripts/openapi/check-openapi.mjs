// OpenAPI freshness + validity gate (Feature 14, option b: hand-maintained spec).
//
// Fails (exit 1) when:
//   1. swagger.yaml is not a valid OpenAPI document (structure / unresolved $refs), or
//   2. the real Hono route inventory and swagger.yaml `paths` disagree —
//      a route in code with no documented path+method (undocumented), or a
//      documented path+method with no route (phantom).
//
// This is the guardrail every "swagger + Bruno + tests" step relies on. It
// catches missing/renamed/re-pathed endpoints and method changes; it does NOT
// verify request/response *shapes* (that's the api-contract-sync review rule).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadYaml } from "js-yaml";
import SwaggerParser from "@apidevtools/swagger-parser";
import { getRealRoutes, HTTP_METHODS } from "./route-inventory.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SPEC = path.resolve(HERE, "../../swagger.yaml");

function fail(msg) {
  console.error(`\n✖ OpenAPI check failed: ${msg}\n`);
  process.exit(1);
}

// 1) Validate the document (also parses YAML — a syntax error fails here).
try {
  // Parse our own copy first so a YAML error gives a clean message; then let
  // swagger-parser validate structure + resolve all $refs.
  loadYaml(fs.readFileSync(SPEC, "utf8"));
  await SwaggerParser.validate(SPEC);
  console.log("✓ swagger.yaml is a valid OpenAPI document");
} catch (err) {
  fail(`swagger.yaml did not validate:\n${err.message}`);
}

// 2) Freshness diff: real routes vs documented operations.
const spec = loadYaml(fs.readFileSync(SPEC, "utf8"));
const documented = new Set();
for (const [p, ops] of Object.entries(spec.paths ?? {})) {
  for (const m of Object.keys(ops)) {
    if (HTTP_METHODS.includes(m)) documented.add(`${m.toUpperCase()} ${p}`);
  }
}

const real = new Set(getRealRoutes().map((r) => `${r.method} ${r.path}`));

const undocumented = [...real].filter((op) => !documented.has(op)).sort();
const phantom = [...documented].filter((op) => !real.has(op)).sort();

if (undocumented.length || phantom.length) {
  if (undocumented.length) {
    console.error(
      `\n✖ ${undocumented.length} route(s) in code but NOT in swagger.yaml (undocumented):`,
    );
    undocumented.forEach((op) => console.error(`    ${op}`));
  }
  if (phantom.length) {
    console.error(
      `\n✖ ${phantom.length} operation(s) in swagger.yaml with NO route (phantom):`,
    );
    phantom.forEach((op) => console.error(`    ${op}`));
  }
  console.error(
    "\nUpdate swagger.yaml (and the bruno/ collection) to match the routes — see " +
      ".claude/rules/api-contract-sync.md.\n",
  );
  process.exit(1);
}

console.log(
  `✓ swagger.yaml matches the route inventory (${real.size} operations, ${Object.keys(spec.paths).length} paths)`,
);
