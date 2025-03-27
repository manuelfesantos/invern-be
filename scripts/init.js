/* eslint-disable */
import { execSync } from "child_process";

// Function to execute shell commands synchronously
function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// Step 1: Install npm dependencies
executeCommand("npm install");

// Step 2: Pull the latest libsql-server image from GitHub Container Registry
executeCommand("docker pull ghcr.io/tursodatabase/libsql-server:latest");

// Step 3: Create a Docker container named 'turso-db' with port 8080 exposed
executeCommand(
  "docker create --name turso-db -p 8080:8080 ghcr.io/tursodatabase/libsql-server:latest",
);

console.log("Setup completed successfully.");
