import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const interests = pgTable(
  "interests",
  {
    user_name: text("user_name").notNull(),
    event_id: text("event_id").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.user_name, table.event_id] })],
);

export type InterestRow = typeof interests.$inferSelect;
