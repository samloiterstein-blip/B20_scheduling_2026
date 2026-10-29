import { readFileSync } from "node:fs";
import { Client } from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i), line.slice(i + 1).replace(/^["']|["']$/g, "")];
    }),
);

const sql = readFileSync("schema.sql", "utf8");
const client = new Client({
  connectionString: env.DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(sql);
const result = await client.query(
  "SELECT to_regclass('public.interests') AS table_name",
);
console.log("table_name=", result.rows[0].table_name);
await client.end();
