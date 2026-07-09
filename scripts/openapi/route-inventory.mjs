// Resolves the real HTTP route inventory from the Hono route tree
// (apps/backend/src/routes/**), following `.route(prefix, subRouter)` mounts
// from the three roots mounted in server.ts (/public, /private, /stripe).
//
// This is the source of truth the OpenAPI freshness check diffs swagger.yaml
// against. Kept dependency-free (plain fs + regex) so it runs anywhere.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.resolve(HERE, "../../apps/backend/src/routes");

const HTTP_METHODS = ["get", "post", "put", "delete", "patch"];

// Resolve a relative import specifier to a concrete .ts file (module or index).
function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const cand of [base + ".ts", path.join(base, "index.ts")]) {
    if (fs.existsSync(cand)) return cand;
  }
  return null;
}

function parseFile(file) {
  const src = fs.readFileSync(file, "utf8");

  const imports = {};
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+["']([^"']+)["']/g)) {
    const resolved = resolveImport(file, m[2]);
    if (resolved) imports[m[1]] = resolved;
  }

  const mounts = [];
  for (const m of src.matchAll(/\.route\(\s*["'`]([^"'`]+)["'`]\s*,\s*(\w+)\s*\)/g)) {
    mounts.push({ prefix: m[1], varName: m[2] });
  }

  const handlers = [];
  for (const m of src.matchAll(
    /\.(get|post|put|delete|patch)\(\s*["'`]([^"'`]+)["'`]/g,
  )) {
    // Router handler paths always start with "/". Skip method-name collisions
    // on non-router objects — e.g. `headers.get("x-...")`, `params.get("id")`.
    if (!m[2].startsWith("/")) continue;
    handlers.push({ method: m[1].toUpperCase(), subpath: m[2] });
  }

  return { imports, mounts, handlers };
}

// "/a//b/" -> "/a/b"; Hono ":param" -> OpenAPI "{param}".
function normalizePath(p) {
  let out = ("/" + p).replace(/\/+/g, "/");
  if (out.length > 1) out = out.replace(/\/$/, "");
  return out.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function walk(file, prefix, out) {
  const { imports, mounts, handlers } = parseFile(file);
  for (const h of handlers) {
    const full = normalizePath(prefix + "/" + h.subpath) || "/";
    out.push({ method: h.method, path: full });
  }
  for (const mo of mounts) {
    const child = imports[mo.varName];
    if (child) walk(child, prefix + "/" + mo.prefix, out);
    else {
      throw new Error(
        `Unresolved mount ${mo.varName} at ${normalizePath(prefix + "/" + mo.prefix)} (in ${file})`,
      );
    }
  }
}

/** All real operations as a sorted list of `{ method, path }`. */
export function getRealRoutes() {
  const out = [];
  walk(path.join(ROUTES_DIR, "health.ts"), "/health", out);
  walk(path.join(ROUTES_DIR, "public/index.ts"), "/public", out);
  walk(path.join(ROUTES_DIR, "private/index.ts"), "/private", out);
  walk(path.join(ROUTES_DIR, "stripe/index.ts"), "/stripe", out);
  return out.sort((a, b) =>
    (a.path + a.method).localeCompare(b.path + b.method),
  );
}

export { HTTP_METHODS };
