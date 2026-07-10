/**
 * Kill any process listening on the given port(s). macOS/Linux.
 *
 * Usage: node scripts/kill-port.mjs <port> [<port> ...]
 *
 * Exit code is always 0 — if nothing is listening, it's a no-op. Safe to chain
 * before a server start (e.g. in nodemon's exec) to avoid EADDRINUSE when a
 * previous run hasn't fully released the port yet.
 */
import { execSync } from "node:child_process";

const ports = process.argv.slice(2).map(Number).filter(Boolean);

if (ports.length === 0) {
  console.error("Usage: node scripts/kill-port.mjs <port> [<port> ...]");
  process.exit(1);
}

for (const port of ports) {
  try {
    // -sTCP:LISTEN so we only match the owner of the port, not clients
    // connected to it (e.g. Docker's forwarder).
    const output = execSync(`lsof -ti :${port} -sTCP:LISTEN`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const pids = new Set(output.trim().split("\n").map(Number).filter(Boolean));
    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "pipe" });
        console.log(`Killed PID ${pid} on port ${port}`);
      } catch {
        // Already exited.
      }
    }
  } catch {
    // Nothing listening on this port.
  }
}
