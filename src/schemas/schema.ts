import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// TODO: We should clear unused entries

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  userName: varchar({ length: 255 }).notNull(),
  roomId: uuid().references(() => roomsTable.id),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});

export const roomsTable = pgTable("rooms", {
  id: uuid().defaultRandom().primaryKey(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp(),
});
