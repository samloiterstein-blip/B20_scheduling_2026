import "server-only";

import { getTableColumns } from "drizzle-orm";

import { getDb, getPool } from "./db";
import { getRealtime } from "./realtime";
import { interests, type InterestRow } from "./schema";
import { isTeamMember } from "./users";

export type Interest = {
  user_name: string;
  event_id: string;
  created_at: string | Date;
};

export type WriteResult =
  | { kind: "committed"; txid: string; interested: boolean }
  | { kind: "unchanged" };

function interestsQuery() {
  return getDb().select(getTableColumns(interests)).from(interests);
}

export function sealInterests() {
  return getRealtime().seal({ query: interestsQuery() });
}

function serialize(row: InterestRow): Interest {
  return {
    user_name: row.user_name,
    event_id: row.event_id,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function listInterests() {
  const rows = await interestsQuery();
  return rows.map(serialize);
}

export async function loadInterests() {
  const query = interestsQuery();
  const [rows, sealedQuery] = await Promise.all([
    query,
    getRealtime().seal({ query }),
  ]);
  return { rows: rows.map(serialize), sealedQuery };
}

export async function toggleInterest(
  userName: string,
  eventId: string,
): Promise<WriteResult> {
  if (!isTeamMember(userName) || !eventId) {
    return { kind: "unchanged" };
  }

  const result = await getPool().query<{ action: string; txid: string }>(
    `WITH deleted AS (
       DELETE FROM interests
       WHERE user_name = $1 AND event_id = $2
       RETURNING 'removed'::text AS action, pg_current_xact_id()::text AS txid
     ), inserted AS (
       INSERT INTO interests (user_name, event_id)
       SELECT $1::text, $2::text
       WHERE NOT EXISTS (SELECT 1 FROM deleted)
       RETURNING 'added'::text AS action, pg_current_xact_id()::text AS txid
     )
     SELECT * FROM deleted
     UNION ALL
     SELECT * FROM inserted`,
    [userName, eventId],
  );

  const row = result.rows[0];
  if (!row) return { kind: "unchanged" };
  return {
    kind: "committed",
    txid: row.txid,
    interested: row.action === "added",
  };
}
