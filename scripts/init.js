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

// Function to check if a Docker container exists
function containerExists(containerName) {
  try {
    execSync(`docker container inspect "${containerName}"`, {
      stdio: "ignore",
    });
    return true; // Container exists
  } catch (error) {
    return false; // Container does not exist
  }
}

// Proceed with your other commands
executeCommand("npm install");

const CONTAINER_NAME = "turso-db";

// Check if the container exists
if (containerExists(CONTAINER_NAME)) {
  console.log(`Container '${CONTAINER_NAME}' already exists.`);
  // Optionally, remove the existing container
  // executeCommand(`docker container rm "${CONTAINER_NAME}"`);
} else {
  console.log(
    `Container '${CONTAINER_NAME}' does not exist. Creating a new one.`,
  );
  // Create the new container
  executeCommand(
    `docker container create --name "${CONTAINER_NAME}" -p 8080:8080 ghcr.io/tursodatabase/libsql-server:latest`,
  );
}
