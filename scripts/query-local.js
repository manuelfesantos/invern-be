/* eslint-disable */
const args = process.argv.slice(2);

const query = args[0];

const getTableData = (header, rows) => {
  return rows.map((row) => {
    const rowObject = {};
    header.forEach((key, index) => {
      rowObject[key] = row[index];
    });
    return rowObject;
  });
};

export const queryDatabase = async (url, query) => {
  const data = await (
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statements: [query],
      }),
    })
  ).json();
  const tableData = getTableData(data[0].results.columns, data[0].results.rows);
  console.log(`Rows read: ${data[0].results.rows_read}`);
  console.log(`Rows written: ${data[0].results.rows_written}`);
  if (tableData.length === 0) return;
  console.table(tableData);
};

if (!query) {
  console.error("Usage: node query-db.js <query>");
  process.exit(1);
}

queryDatabase("http://localhost:8080", query);
