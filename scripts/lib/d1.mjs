/**
 * Shared helpers for the D1 CLI scripts (seed, create-admin).
 * Executes SQL against local or remote D1 via `wrangler d1 execute`.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ENVS = { local: { remote: false }, preview: { remote: true }, prod: { remote: true } };

/** Read `--name value` or `--name=value` (boolean when value-less). */
export const getFlag = (argv, name, def) => {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split("=").slice(1).join("=");
  const idx = argv.indexOf(`--${name}`);
  if (idx !== -1) {
    const next = argv[idx + 1];
    return next && !next.startsWith("--") ? next : true;
  }
  return def;
};

/** Resolve the target environment/database from CLI args (exits on bad --env). */
export const resolveTarget = (argv) => {
  const env = String(getFlag(argv, "env", "local"));
  const database = String(getFlag(argv, "database", "invern-db"));
  const confirm = Boolean(getFlag(argv, "yes", false));
  const dryRun = Boolean(getFlag(argv, "dry-run", false));
  if (!ENVS[env]) {
    console.error(`✗ Unknown --env "${env}". Use one of: ${Object.keys(ENVS).join(", ")}`);
    process.exit(1);
  }
  return { env, database, confirm, dryRun, remote: ENVS[env].remote };
};

/**
 * Run `sql` against the target. Handles --dry-run (print + exit) and the
 * remote-write safety guard (requires --yes). Returns true on success.
 */
export const executeSql = (sql, target) => {
  if (target.dryRun) {
    console.log("\n--- dry run: SQL below, not executed ---\n");
    console.log(sql);
    process.exit(0);
  }
  if (target.remote && !target.confirm) {
    console.error(`\n✗ Refusing to write to a REMOTE (${target.env}) database without --yes.`);
    console.error(`  Re-run with: --env=${target.env} --yes`);
    process.exit(1);
  }
  const file = join(tmpdir(), `invern-d1-${process.pid}-${Date.now()}.sql`);
  writeFileSync(file, sql);
  try {
    const args = ["wrangler", "d1", "execute", target.database, target.remote ? "--remote" : "--local", "--file", file];
    console.log(`\n  running: npx ${args.join(" ")}\n`);
    execFileSync("npx", args, { stdio: "inherit" });
    return true;
  } catch (err) {
    console.error("\n✗ Failed.", err?.message ?? err);
    process.exitCode = 1;
    return false;
  } finally {
    try { unlinkSync(file); } catch { /* ignore */ }
  }
};

/** Escape a JS value for inline SQL. */
export const sqlValue = (v) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return `'${String(v).replace(/'/g, "''")}'`;
};
