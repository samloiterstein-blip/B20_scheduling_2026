import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getEnv } from "./env";
import * as schema from "./schema";

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getEnv().databaseUrl,
      max: 5,
    });
    if (process.env.VERCEL) {
      attachDatabasePool(pool);
    }
  }
  return pool;
}

export function getDb() {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}
