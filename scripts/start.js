import { execSync } from "child_process";

const args = process.argv.slice(2);

const protocol = args[0] || "http";

if (!["http", "https"].includes(protocol)) {
  console.error("Invalid protocol. Use 'http' or 'https'.");
  process.exit(1);
}

// Function to execute shell commands synchronously
function executeCommand(command, options = {}, ignoreError = false) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit", ...options });
  } catch (error) {
    if (ignoreError) return;
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Start the development server
executeCommand(
  `npx wrangler pages dev functions --local-protocol=${protocol} --show-interactive-dev-session=false`,
);

// Handle termination signals to stop the development server gracefully
process.on("close", (code) => {
  console.log(`Dev server exited with code ${code}`);
});
