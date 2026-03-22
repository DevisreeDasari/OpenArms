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

// Let the explicit `ssl` Pool option control TLS behavior.
// Some environments surface "self-signed certificate in certificate chain" when
// `sslmode` in the connection string triggers stricter verification.
databaseUrl.searchParams.delete("sslmode");
databaseUrl.searchParams.delete("sslrootcert");
databaseUrl.searchParams.delete("sslcert");
databaseUrl.searchParams.delete("sslkey");

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

const shouldDisableTlsVerify = dbHostname.endsWith(".pooler.supabase.com") || dbHostname.endsWith(".supabase.co");

export const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ...(dbHostAddr ? { hostaddr: dbHostAddr } : {}),
  ...(shouldDisableTlsVerify
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});
