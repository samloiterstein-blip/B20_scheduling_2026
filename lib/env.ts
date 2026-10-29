import "server-only";

export type AppEnv = {
  databaseUrl: string;
  databaseUrlUnpooled: string;
  realtimeUrl: string;
  realtimeSecret: string;
  database: string;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function databaseName(url: string) {
  const parsed = new URL(url);
  return decodeURIComponent(parsed.pathname.replace(/^\//, "") || "neondb");
}

let cached: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const databaseUrl = required("DATABASE_URL");
  cached = {
    databaseUrl,
    databaseUrlUnpooled: required("DATABASE_URL_UNPOOLED"),
    realtimeUrl: required("NEON_REALTIME_URL"),
    realtimeSecret: required("NEON_REALTIME_SECRET"),
    database: databaseName(databaseUrl),
  };
  return cached;
}
