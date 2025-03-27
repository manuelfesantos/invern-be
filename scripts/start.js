/* eslint-disable */
import { execSync, spawn } from "child_process";

// Function to execute shell commands synchronously
function executeCommand(command, options = {}) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit", ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// Start the Docker container
executeCommand("docker start turso-db");

// Ensure the Docker container stops on process exit
const stopContainer = () => {
  console.log("Stopping Docker container: turso-db");
  execSync("docker stop turso-db");
  process.exit();
};

// Attach event listeners for graceful termination
process.on("SIGINT", stopContainer);
process.on("SIGTERM", stopContainer);
process.on("exit", stopContainer);

// Execute the migration
executeCommand("npx drizzle-kit migrate");

// Run the triggers script
executeCommand("node drizzle/triggers/run-triggers.js");

// Start the development server
const devServer = spawn(
  "npx",
  [
    "wrangler",
    "pages",
    "dev",
    "functions",
    "--show-interactive-dev-session=false",
  ],
  { stdio: "inherit" },
);

// Handle termination signals to stop the development server gracefully
devServer.on("close", (code) => {
  console.log(`Dev server exited with code ${code}`);
  stopContainer();
});
