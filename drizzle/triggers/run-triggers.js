/* eslint-disable */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

function executeSqlFiles(folderPath, tursoUrl) {
  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    console.error(`Error: Folder '${folderPath}' does not exist.`);
    return;
  }

  // Loop through each file in the folder
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    files.forEach((file) => {
      if (file.endsWith(".sql")) {
        const filePath = path.join(folderPath, file);
        console.log(`Executing: ${filePath}`);

        // Read the SQL contents
        fs.readFile(filePath, "utf8", (err, sqlContent) => {
          if (err) {
            console.error(`Error reading ${file}:`, err);
            return;
          }

          // Remove all line breaks from the SQL content
          const cleanedSqlContent = sqlContent
            .replace(/\n/g, " ")
            .replace(/\r/g, " ");

          // Execute the SQL using turso db shell
          exec(
            `turso db shell ${tursoUrl} "${cleanedSqlContent}"`,
            (error, stdout, stderr) => {
              if (error) {
                console.error(`Error executing ${file}:`, error.message);
                return;
              }
              if (stderr) {
                console.error(`stderr from ${file}:`, stderr);
                return;
              }
              console.log(`Successfully executed ${file}:
${stdout}`);
            },
          );
        });
      }
    });
  });
}

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const folderPath = __dirname;

console.log(`Executing SQL files in folder: ${folderPath}`);
const tursoUrl = "http://127.0.0.1:8080";

executeSqlFiles(folderPath, tursoUrl);
