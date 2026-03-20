import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { pool } from "../src/config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const schemaPath = path.resolve(__dirname, "../schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");

  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const stmt of statements) {
      await client.query(stmt);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  // eslint-disable-next-line no-console
  console.log("[backend] schema applied successfully");

  await pool.end();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[backend] failed to apply schema:", err);
  process.exit(1);
});
