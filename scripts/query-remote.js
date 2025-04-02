import dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

/* eslint-disable */
const args = process.argv.slice(2);

const mode = args[0];
const query = args[1];

const modeToUrlEnvMap = {
  preview: "PREVIEW_TURSO_CONNECTION_URL",
  prod: "PROD_TURSO_CONNECTION_URL",
};

const modeToTokenEnvMap = {
  preview: "PREVIEW_TURSO_AUTH_TOKEN",
  prod: "PROD_TURSO_AUTH_TOKEN",
};

const getTableData = (header, rows) => {
  return rows.map((row) => {
    const rowObject = {};
    header.forEach((key, index) => {
      rowObject[key] = row[index].value;
    });
    return rowObject;
  });
};

export const queryDatabase = async (mode, query) => {
  const url = process.env[modeToUrlEnvMap[mode]];
  const token = process.env[modeToTokenEnvMap[mode]];

  if (!url || !token) {
    console.error(`Missing environment variables for mode: ${mode}`);
    process.exit(1);
  }
  const data = await (
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        requests: [
          {
            stmt: { sql: query, want_rows: true },
            type: "execute",
          },
        ],
      }),
    })
  ).json();
  const tableData = getTableData(
    data.results[0].response.result.cols.map((col) => col.name),
    data.results[0].response.result.rows,
  );
  console.log(`Rows read: ${data.results[0].response.result.rows_read}`);
  console.log(`Rows written: ${data.results[0].response.result.rows_written}`);
  if (tableData.length === 0) return;
  console.table(tableData);
};

if (!mode || !query) {
  console.error("Usage: node query-db.js <preview|prod> <query>");
  process.exit(1);
}

queryDatabase(mode, query);
