#!/usr/bin/env node
/**
 * Create (or reset) an admin user directly in D1.
 *
 *   node scripts/create-admin.mjs --email=me@x.com --password='s3cret!!'
 *   node scripts/create-admin.mjs --email=me@x.com --password='s3cret!!' --env=preview --yes
 *   node scripts/create-admin.mjs --email=me@x.com --password='s3cret!!' --first-name=Ana --role=ADMIN
 *
 * Hashes the password with the same PBKDF2 scheme the app uses
 * (libs/utils/crypto/password.ts), inserts a validated user, and upserts on
 * email — so re-running resets that user's password/role (idempotent by email).
 *
 * Options:
 *   --email <email>              required
 *   --password <password>        required (min 8 chars)
 *   --first-name <name>          default: the email's local part
 *   --role <ADMIN|USER>          default: ADMIN
 *   --env <local|preview|prod>   default: local
 *   --database <name>            default: invern-db
 *   --yes                        confirm a write to a REMOTE (preview/prod) DB
 *   --dry-run                    print the SQL and exit
 */
import { randomUUID } from "node:crypto";
import { resolveTarget, executeSql, getFlag, sqlValue } from "./lib/d1.mjs";

const argv = process.argv.slice(2);
const email = getFlag(argv, "email");
const password = getFlag(argv, "password");
const role = String(getFlag(argv, "role", "ADMIN")).toUpperCase();
const firstName = getFlag(argv, "first-name", typeof email === "string" ? email.split("@")[0] : "Admin");

if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("✗ --email is required and must be a valid email address.");
  process.exit(1);
}
if (typeof password !== "string" || password.length < 8) {
  console.error("✗ --password is required and must be at least 8 characters.");
  process.exit(1);
}
if (!["ADMIN", "USER"].includes(role)) {
  console.error(`✗ --role must be ADMIN or USER (got "${role}").`);
  process.exit(1);
}

const target = resolveTarget(argv);

// PBKDF2-HMAC-SHA256, matching libs/utils/crypto/password.ts exactly so the
// login flow's verifyPassword accepts it. Format:
//   pbkdf2$sha256$<iterations>$<base64 salt>$<base64 hash>
const PBKDF2_ITERATIONS = 600_000;
const DERIVED_BITS = 256;
const SALT_BYTES = 16;
const toBase64 = (bytes) => Buffer.from(bytes).toString("base64");

const hashPassword = async (plain) => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(plain),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      keyMaterial,
      DERIVED_BITS,
    ),
  );
  return ["pbkdf2", "sha256", PBKDF2_ITERATIONS, toBase64(salt), toBase64(derived)].join("$");
};

const passwordHash = await hashPassword(password);
const id = randomUUID();

const row = [id, email, firstName, null, passwordHash, role, false, true].map(sqlValue).join(", ");
const sql = `INSERT INTO users (id, email, first_name, last_name, password, role, is_oauth, is_validated) VALUES
  (${row})
ON CONFLICT(email) DO UPDATE SET
  first_name = excluded.first_name,
  password = excluded.password,
  role = excluded.role,
  is_validated = excluded.is_validated;
`;

console.log(`Create admin → env=${target.env} database=${target.database} ${target.remote ? "(REMOTE)" : "(local)"}`);
console.log(`  email=${email} role=${role} first_name=${firstName} validated=true`);

if (executeSql(sql, target)) {
  console.log(`\n✓ Admin ready: ${email} (role ${role}). Log in with the password you provided.`);
}
