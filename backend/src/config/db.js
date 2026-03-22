import dns from "dns";
import pg from "pg";
import dotenv from "dotenv";
import { URL } from "url";

const { Pool } = pg;

dotenv.config();

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const dbHostname = databaseUrl.hostname;

let dbHostAddr;
try {
  const lookedUpAll = await dns.promises.lookup(dbHostname, { all: true });
  const ipv4Record = lookedUpAll.find((r) => r.family === 4);
  dbHostAddr = ipv4Record?.address;
  if (!dbHostAddr) {
    // eslint-disable-next-line no-console
    console.warn(`[backend] no IPv4 found for DB host; falling back to default resolution: ${dbHostname}`);
  }
} catch {
  dbHostAddr = undefined;
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(dbHostAddr ? { hostaddr: dbHostAddr } : {}),
});
